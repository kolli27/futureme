import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBillingPortalSession, stripe } from '@/lib/stripe'
import { userModel } from '@/lib/db/models/user'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not available at this time' },
        { status: 503 }
      )
    }
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { returnUrl } = body

    // Validate return URL
    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Return URL is required' },
        { status: 400 }
      )
    }

    // Get user with subscription info
    const userWithSubscription = await userModel.findWithProgressAndSubscription(session.user.id)
    if (!userWithSubscription?.subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No customer found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const portalSession = await createBillingPortalSession(
      userWithSubscription.subscription.stripe_customer_id,
      returnUrl
    )

    return NextResponse.json({
      success: true,
      data: {
        url: portalSession.url
      }
    })

  } catch (error) {
    console.error('Stripe Customer Portal API Error:', error)
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found. Please contact support.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create billing portal session. Please try again.'
      },
      { status: 500 }
    )
  }
}