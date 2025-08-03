import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createCheckoutSession, 
  getOrCreateStripeCustomer, 
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  stripe 
} from '@/lib/stripe'
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
    if (!session?.user?.id || !session.user.email || !session.user.name) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { planId, successUrl, cancelUrl } = body

    // Validate plan ID
    if (!planId || !SUBSCRIPTION_PLANS[planId as SubscriptionPlan]) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      )
    }

    // Validate URLs
    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success and cancel URLs are required' },
        { status: 400 }
      )
    }

    // Don't allow checkout for free plan
    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Cannot create checkout session for free plan' },
        { status: 400 }
      )
    }

    // Get user with subscription info
    const userWithSubscription = await userModel.findWithProgressAndSubscription(session.user.id)
    if (!userWithSubscription) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    if (userWithSubscription.subscription?.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer(
      session.user.email,
      session.user.name,
      session.user.id,
      userWithSubscription.subscription?.stripe_customer_id || undefined
    )

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      stripeCustomer.id,
      planId as SubscriptionPlan,
      session.user.id,
      successUrl,
      cancelUrl
    )

    // Update user's stripe customer ID if it's new
    if (userWithSubscription.subscription?.stripe_customer_id !== stripeCustomer.id) {
      // This would be handled by the subscription model when we create it
      console.log('Should update user stripe_customer_id:', stripeCustomer.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      }
    })

  } catch (error) {
    console.error('Stripe Checkout API Error:', error)
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found. Please try again.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Subscription plan not available. Please contact support.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create checkout session. Please try again.'
      },
      { status: 500 }
    )
  }
}