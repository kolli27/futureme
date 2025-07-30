/**
 * Email Verification API Endpoint
 * 
 * Handles email verification tokens and account activation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { tokenService } from '@/lib/auth/tokens'
import { emailService } from '@/lib/auth/email'
import { userModel } from '@/lib/db/models/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify email with token
    const result = await tokenService.verifyEmail(token)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Invalid or expired verification token',
          code: 'VERIFICATION_FAILED'
        },
        { status: 400 }
      )
    }

    // Send welcome email
    if (result.user) {
      await emailService.sendWelcome(result.user.email, result.user.name)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully! You can now sign in.',
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      {
        error: 'Verification failed. Please try again.',
        code: 'VERIFICATION_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?error=missing_token', request.url))
    }

    // Verify the token exists and is valid
    const tokenData = await tokenService.findValidToken(token, 'email_verification')
    
    if (!tokenData) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', request.url))
    }

    // Redirect to verification page with token
    return NextResponse.redirect(new URL(`/auth/verify?token=${token}`, request.url))

  } catch (error) {
    console.error('Email verification GET error:', error)
    return NextResponse.redirect(new URL('/auth/error?error=verification_failed', request.url))
  }
}