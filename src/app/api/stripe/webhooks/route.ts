import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { 
  validateWebhookSignature, 
  processWebhookEvent, 
  getPlanByStripePriceId,
  stripe 
} from '@/lib/stripe'
import { userModel } from '@/lib/db/models/user'
import { query } from '@/lib/db/config'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not available at this time' },
        { status: 503 }
      )
    }
    // Get the raw body
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Validate webhook signature
    const event = validateWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log('Processing webhook event:', event.type, event.id)

    // Process the webhook event
    const result = await processWebhookEvent(event)

    if (!result.success) {
      console.error('Failed to process webhook event:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Handle specific actions
    if (result.action && result.data) {
      await handleWebhookAction(result.action, result.data, event)
    }

    return NextResponse.json({
      success: true,
      action: result.action
    })

  } catch (error) {
    console.error('Stripe Webhook Error:', error)
    
    if (error instanceof Error && error.message.includes('Invalid webhook signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleWebhookAction(action: string, data: any, event: any) {
  try {
    switch (action) {
      case 'subscription_updated':
        await handleSubscriptionUpdated(data, event)
        break
        
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data)
        break
        
      case 'payment_succeeded':
        await handlePaymentSucceeded(data)
        break
        
      case 'payment_failed':
        await handlePaymentFailed(data)
        break
        
      default:
        console.log('Unhandled webhook action:', action)
    }
  } catch (error) {
    console.error('Error handling webhook action:', action, error)
    throw error
  }
}

async function handleSubscriptionUpdated(data: any, event: any) {
  const { subscriptionId, customerId, status, currentPeriodEnd, cancelAtPeriodEnd, planId } = data
  
  // Find user by Stripe customer ID
  const user = await query<any>(
    'SELECT id FROM users WHERE id IN (SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = $1)',
    [customerId]
  )

  if (!user || user.length === 0) {
    console.error('User not found for customer:', customerId)
    return
  }

  const userId = user[0].id

  // Get subscription object to extract plan info
  const subscription = event.data.object
  const priceId = subscription.items?.data[0]?.price?.id
  const detectedPlan = getPlanByStripePriceId(priceId) || planId || 'pro'

  // Upsert subscription record
  await query(
    `INSERT INTO user_subscriptions (
      user_id, plan, status, stripe_subscription_id, stripe_customer_id,
      current_period_start, current_period_end, cancel_at_period_end,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      detectedPlan,
      status,
      subscriptionId,
      customerId,
      new Date(subscription.current_period_start * 1000),
      currentPeriodEnd,
      cancelAtPeriodEnd
    ]
  )

  console.log('Updated subscription for user:', userId, 'plan:', detectedPlan, 'status:', status)
}

async function handleSubscriptionCancelled(data: any) {
  const { subscriptionId, customerId } = data
  
  // Update subscription status to cancelled
  await query(
    `UPDATE user_subscriptions 
     SET status = 'canceled', canceled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1 AND stripe_customer_id = $2`,
    [subscriptionId, customerId]
  )

  console.log('Cancelled subscription:', subscriptionId)
}

async function handlePaymentSucceeded(data: any) {
  const { subscriptionId, customerId, amountPaid, invoiceId } = data
  
  // Update subscription status to active (in case it was past_due)
  await query(
    `UPDATE user_subscriptions 
     SET status = 'active', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1 AND stripe_customer_id = $2`,
    [subscriptionId, customerId]
  )

  // Log successful payment (you might want to store payment history)
  console.log('Payment succeeded:', {
    subscriptionId,
    customerId,
    amountPaid,
    invoiceId
  })
}

async function handlePaymentFailed(data: any) {
  const { subscriptionId, customerId, invoiceId } = data
  
  // Update subscription status to past_due
  await query(
    `UPDATE user_subscriptions 
     SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1 AND stripe_customer_id = $2`,
    [subscriptionId, customerId]
  )

  // You might want to send notification emails here
  console.log('Payment failed:', {
    subscriptionId,
    customerId,
    invoiceId
  })
}