/**
 * User Registration API Endpoint
 * 
 * Handles user registration with email verification,
 * password validation, and security measures.
 */

import { NextRequest, NextResponse } from 'next/server'
import { userModel } from '@/lib/db/models/user'
import { tokenService } from '@/lib/auth/tokens'
import { emailService } from '@/lib/auth/email'
import { 
  registerSchema, 
  hashPassword, 
  sanitizeInput
} from '@/lib/auth/password'
import { authMiddleware, rateLimitConfigs } from '@/lib/auth/middleware'

export async function POST(request: NextRequest) {
  try {
    // Validate request size
    if (!authMiddleware.validateRequestSize(request, 10)) { // 10KB limit
      return authMiddleware.createRateLimitResponse(
        { success: false, limit: 0, remaining: 0, reset: new Date() },
        'Request too large'
      )
    }

    // Validate origin (CSRF protection)
    if (!authMiddleware.validateOrigin(request)) {
      authMiddleware.logSecurityEvent('invalid_origin', {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      })
      return NextResponse.json(
        { error: 'Invalid request origin', code: 'INVALID_ORIGIN' },
        { status: 403 }
      )
    }

    // Rate limiting check
    const rateLimitResult = await authMiddleware.rateLimit(request, rateLimitConfigs.register)
    if (!rateLimitResult.success) {
      authMiddleware.logSecurityEvent('rate_limit_exceeded', {
        endpoint: 'register',
        identifier: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return authMiddleware.createRateLimitResponse(rateLimitResult)
    }

    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { email, password, name, acceptTerms } = validationResult.data

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase()
    const sanitizedName = sanitizeInput(name)

    // Check if user already exists
    const existingUser = await userModel.findByEmail(sanitizedEmail)
    if (existingUser) {
      // Don't reveal that user exists for security
      return NextResponse.json(
        {
          success: true,
          message: 'Registration successful! Please check your email to verify your account.'
        },
        { status: 200 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const newUser = await userModel.create({
      email: sanitizedEmail,
      password_hash: passwordHash,
      name: sanitizedName,
      timezone: 'UTC',
      locale: 'en',
      role: 'user',
      is_active: false, // Require email verification in production
      onboarding_completed: false,
      email_verified_at: process.env.NODE_ENV === 'development' ? new Date() : undefined
    })

    // Create email verification token
    const verificationToken = await tokenService.createEmailVerificationToken(newUser.id)

    // Send verification email
    const emailSent = await emailService.sendEmailVerification(
      newUser.email, 
      newUser.name, 
      verificationToken
    )

    if (!emailSent) {
      console.error('Failed to send verification email to:', newUser.email)
      // In production, you might want to queue this for retry
    }

    // Log successful registration
    console.log(`✅ User registered: ${sanitizedEmail}`)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        userId: newUser.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Don't expose internal errors to client
    return NextResponse.json(
      {
        error: 'Registration failed. Please try again.',
        code: 'REGISTRATION_ERROR'
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