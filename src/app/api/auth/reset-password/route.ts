/**
 * Reset Password API Endpoint
 * 
 * Handles password reset with token validation and password update.
 */

import { NextRequest, NextResponse } from 'next/server'
import { tokenService } from '@/lib/auth/tokens'
import { emailService } from '@/lib/auth/email'
import { resetPasswordSchema, hashPassword, sanitizeInput } from '@/lib/auth/password'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Reset password with token
    const result = await tokenService.resetPasswordWithToken(token, passwordHash)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Invalid or expired reset token',
          code: 'RESET_FAILED'
        },
        { status: 400 }
      )
    }

    // Send password changed notification
    if (result.user) {
      await emailService.sendPasswordChanged(result.user.email, result.user.name)
    }

    console.log(`✅ Password reset successful: ${result.user?.email}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successful. You can now sign in with your new password.',
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      {
        error: 'Password reset failed. Please try again.',
        code: 'RESET_ERROR'
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
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Validate the reset token
    const validation = await tokenService.validatePasswordResetToken(token)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error || 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        message: 'Reset token is valid',
        user: {
          email: validation.user?.email,
          name: validation.user?.name
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset token validation error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to validate reset token',
        code: 'VALIDATION_ERROR'
      },
      { status: 500 }
    )
  }
}