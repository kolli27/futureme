/**
 * Forgot Password API Endpoint
 * 
 * Handles password reset requests and sends reset emails.
 */

import { NextRequest, NextResponse } from 'next/server'
import { userModel } from '@/lib/db/models/user'
import { tokenService } from '@/lib/auth/tokens'
import { emailService } from '@/lib/auth/email'
import { resetRequestSchema, sanitizeInput } from '@/lib/auth/password'

// Rate limiting for password reset requests
const resetRequests = new Map<string, { count: number; lastRequest: Date }>()

function isResetRateLimited(key: string): boolean {
  const now = new Date()
  const requests = resetRequests.get(key)
  
  if (!requests) {
    resetRequests.set(key, { count: 1, lastRequest: now })
    return false
  }
  
  // Reset if more than 1 hour has passed
  if (now.getTime() - requests.lastRequest.getTime() > 60 * 60 * 1000) {
    resetRequests.set(key, { count: 1, lastRequest: now })
    return false
  }
  
  // Allow max 3 reset requests per hour per email/IP combination
  if (requests.count >= 3) {
    return true
  }
  
  requests.count++
  requests.lastRequest = now
  resetRequests.set(key, requests)
  return false
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    const body = await request.json()

    // Validate input
    const validationResult = resetRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid email address',
          details: validationResult.error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data
    const sanitizedEmail = sanitizeInput(email).toLowerCase()

    // Rate limiting check (by email + IP)
    const rateLimitKey = `${sanitizedEmail}:${ip}`
    if (isResetRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Too many password reset requests. Please try again later.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      )
    }

    // Find user
    const user = await userModel.findByEmail(sanitizedEmail)
    
    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    }

    if (!user) {
      console.log(`Password reset requested for non-existent email: ${sanitizedEmail}`)
      return NextResponse.json(successResponse, { status: 200 })
    }

    // Check if account is active
    if (!user.is_active) {
      console.log(`Password reset requested for inactive account: ${sanitizedEmail}`)
      return NextResponse.json(successResponse, { status: 200 })
    }

    // Check if user has a password (OAuth-only users)
    if (!user.password_hash) {
      console.log(`Password reset requested for OAuth-only account: ${sanitizedEmail}`)
      
      // Send a different email explaining they should use social login
      // For now, we'll just log it and return success
      return NextResponse.json(successResponse, { status: 200 })
    }

    // Create password reset token
    const resetToken = await tokenService.createPasswordResetToken(user.id)

    // Send password reset email
    const emailSent = await emailService.sendPasswordReset(
      user.email,
      user.name,
      resetToken
    )

    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email)
      // In production, you might want to queue this for retry
    }

    console.log(`✅ Password reset requested: ${sanitizedEmail}`)
    
    return NextResponse.json(successResponse, { status: 200 })

  } catch (error) {
    console.error('Password reset request error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to process password reset request. Please try again.',
        code: 'RESET_REQUEST_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}