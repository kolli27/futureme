/**
 * Password Security and Validation
 * 
 * Production-ready password handling with secure hashing,
 * validation, and strength checking.
 */

import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Email validation schema
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim()

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Password reset request schema
export const resetRequestSchema = z.object({
  email: emailSchema
})

// Password reset schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // High security level
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Check password strength and return score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Password should be at least 8 characters')

  if (password.length >= 12) score++
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security')

  // Character variety checks
  if (/[a-z]/.test(password)) score++
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Add uppercase letters')

  if (/\d/.test(password)) score++
  else feedback.push('Add numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score++
  else feedback.push('Add special characters (!@#$%^&*)')

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|654321|abcdef|qwerty/i, // Common sequences
    /password|admin|user|login/i // Common words
  ]

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
  if (hasCommonPattern) {
    score = Math.max(0, score - 1)
    feedback.push('Avoid common patterns and words')
  }

  // Normalize score to 0-4 scale
  const normalizedScore = Math.min(4, Math.max(0, score - 2))
  
  return {
    score: normalizedScore,
    feedback,
    isStrong: normalizedScore >= 3
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const crypto = require('crypto')
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    result += charset[randomIndex]
  }
  
  return result
}

/**
 * Generate a secure verification code (6 digits)
 */
export function generateVerificationCode(): string {
  const crypto = require('crypto')
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

/**
 * Check if email domain is allowed (for enterprise features)
 */
export function isAllowedEmailDomain(email: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  
  return allowedDomains.some(allowed => 
    domain === allowed.toLowerCase() || 
    domain.endsWith('.' + allowed.toLowerCase())
  )
}

/**
 * Rate limiting helpers
 */
export interface LoginAttempt {
  email: string
  ip: string
  timestamp: Date
  success: boolean
}

// In-memory store for rate limiting (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt[]>()

export function recordLoginAttempt(email: string, ip: string, success: boolean): void {
  const key = `${email}:${ip}`
  const attempts = loginAttempts.get(key) || []
  
  attempts.push({
    email,
    ip,
    timestamp: new Date(),
    success
  })
  
  // Keep only attempts from last 15 minutes
  const cutoff = new Date(Date.now() - 15 * 60 * 1000)
  const recentAttempts = attempts.filter(attempt => attempt.timestamp > cutoff)
  
  loginAttempts.set(key, recentAttempts)
}

export function isLoginRateLimited(email: string, ip: string): {
  isLimited: boolean
  attemptsRemaining: number
  resetTime?: Date
} {
  const key = `${email}:${ip}`
  const attempts = loginAttempts.get(key) || []
  
  // Keep only attempts from last 15 minutes
  const cutoff = new Date(Date.now() - 15 * 60 * 1000)
  const recentAttempts = attempts.filter(attempt => attempt.timestamp > cutoff)
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success)
  const maxAttempts = 5
  
  if (failedAttempts.length >= maxAttempts) {
    const oldestFailedAttempt = failedAttempts[0]
    const resetTime = new Date(oldestFailedAttempt.timestamp.getTime() + 15 * 60 * 1000)
    
    return {
      isLimited: true,
      attemptsRemaining: 0,
      resetTime
    }
  }
  
  return {
    isLimited: false,
    attemptsRemaining: maxAttempts - failedAttempts.length
  }
}

export default {
  passwordSchema,
  emailSchema,
  registerSchema,
  loginSchema,
  resetRequestSchema,
  resetPasswordSchema,
  hashPassword,
  verifyPassword,
  getPasswordStrength,
  generateSecureToken,
  generateVerificationCode,
  sanitizeInput,
  isAllowedEmailDomain,
  recordLoginAttempt,
  isLoginRateLimited
}