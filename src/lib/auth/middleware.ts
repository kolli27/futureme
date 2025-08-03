/**
 * Authentication Middleware
 * 
 * Production-ready middleware for rate limiting, security headers,
 * and request validation.
 */

import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
interface RateLimitConfig {
  requests: number
  window: string
  identifier: string
}

// In-memory rate limiting for development (use Redis/Upstash in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

class AuthMiddleware {
  constructor() {
    // Simple in-memory rate limiting for now
    // In production, use Redis or similar distributed cache
  }

  /**
   * Rate limiting middleware
   */
  async rateLimit(request: NextRequest, config: RateLimitConfig): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
  }> {
    const identifier = this.getIdentifier(request, config.identifier)
    const windowMs = this.parseWindow(config.window)
    const now = Date.now()

    // Use in-memory store (for production, implement Redis-based solution)
    const key = `${identifier}:${config.window}`
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      // Create new window
      const resetTime = now + windowMs
      rateLimitStore.set(key, { count: 1, resetTime })
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: new Date(resetTime)
      }
    }

    if (record.count >= config.requests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset: new Date(record.resetTime)
      }
    }

    // Increment counter
    record.count++
    rateLimitStore.set(key, record)

    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - record.count,
      reset: new Date(record.resetTime)
    }
  }

  /**
   * Add security headers
   */
  addSecurityHeaders(response: NextResponse): NextResponse {
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    }

    // CSP (Content Security Policy)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://accounts.google.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
    
    response.headers.set('Content-Security-Policy', csp)

    return response
  }

  /**
   * Validate request body size
   */
  validateRequestSize(request: NextRequest, maxSizeKB: number = 1024): boolean {
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024
      return sizeKB <= maxSizeKB
    }
    return true
  }

  /**
   * Get client identifier for rate limiting
   */
  private getIdentifier(request: NextRequest, type: string): string {
    switch (type) {
      case 'ip':
        return this.getClientIP(request)
      case 'user-agent':
        return request.headers.get('user-agent') || 'unknown'
      case 'combined':
        return `${this.getClientIP(request)}:${request.headers.get('user-agent') || 'unknown'}`
      default:
        return this.getClientIP(request)
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return 'unknown'
  }

  /**
   * Parse window string to milliseconds
   */
  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*(ms|s|m|h|d)?$/)
    if (!match) throw new Error(`Invalid window format: ${window}`)
    
    const value = parseInt(match[1])
    const unit = match[2] || 's'
    
    const multipliers: Record<string, number> = {
      'ms': 1,
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    }
    
    return value * multipliers[unit]
  }

  /**
   * Create rate limit response
   */
  createRateLimitResponse(result: { 
    success: boolean
    limit: number
    remaining: number
    reset: Date 
  }, message?: string): NextResponse {
    const response = NextResponse.json(
      {
        error: message || 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000)
      },
      { status: 429 }
    )

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.getTime().toString())
    response.headers.set('Retry-After', Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString())

    return this.addSecurityHeaders(response)
  }

  /**
   * Validate request origin (CSRF protection)
   */
  validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    
    if (!origin && !referer) {
      // Allow requests without origin/referer (e.g., from native apps)
      return true
    }
    
    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      process.env.NEXTAUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean)
    
    if (origin) {
      return allowedOrigins.includes(origin)
    }
    
    if (referer) {
      try {
        const refererUrl = new URL(referer!)
        return allowedOrigins.some(allowed => {
          const allowedUrl = new URL(allowed!)
          return refererUrl.origin === allowedUrl.origin
        })
      } catch {
        return false
      }
    }
    
    return false
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, details: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getEventSeverity(event)
    }
    
    // In production, send to your logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to external logging service
      // await sendToLogService(logEntry)
    }
    
    console.log('Security Event:', JSON.stringify(logEntry, null, 2))
  }

  private getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'rate_limit_exceeded': 'medium',
      'invalid_origin': 'high',
      'oversized_request': 'medium',
      'brute_force_attempt': 'high',
      'suspicious_activity': 'high',
      'authentication_failure': 'medium'
    }
    
    return severityMap[event] || 'low'
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware()

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Authentication endpoints
  login: { requests: 5, window: '15m', identifier: 'combined' },
  register: { requests: 3, window: '1h', identifier: 'ip' },
  forgotPassword: { requests: 3, window: '1h', identifier: 'combined' },
  resetPassword: { requests: 5, window: '1h', identifier: 'ip' },
  
  // API endpoints
  api: { requests: 100, window: '15m', identifier: 'ip' },
  apiStrict: { requests: 10, window: '1m', identifier: 'combined' },
  
  // General
  general: { requests: 1000, window: '1h', identifier: 'ip' }
}

export default authMiddleware