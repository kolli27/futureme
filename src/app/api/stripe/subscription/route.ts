import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getSubscription, 
  cancelSubscription, 
  reactivateSubscription, 
  updateSubscriptionPlan,
  SubscriptionPlan 
} from '@/lib/stripe'
import { userModel } from '@/lib/db/models/user'

// GET - Get current subscription details
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get user with subscription info
    const userWithSubscription = await userModel.findWithProgressAndSubscription(session.user.id)
    
    if (!userWithSubscription?.subscription) {
      return NextResponse.json({
        success: true,
        data: {
          plan: 'free',
          status: null,
          subscription: null
        }
      })
    }

    const subscription = userWithSubscription.subscription

    // Get detailed Stripe subscription if available
    let stripeSubscription = null
    if (subscription.stripe_subscription_id) {
      stripeSubscription = await getSubscription(subscription.stripe_subscription_id)
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        stripeCustomerId: subscription.stripe_customer_id,
        subscription: stripeSubscription ? {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
          trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
        } : null
      }
    })

  } catch (error) {
    console.error('Get Subscription API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve subscription details'
      },
      { status: 500 }
    )
  }
}

// PUT - Update subscription (cancel, reactivate, change plan)
export async function PUT(request: NextRequest) {
  try {
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
    const { action, planId, cancelAtPeriodEnd = true } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get user with subscription info
    const userWithSubscription = await userModel.findWithProgressAndSubscription(session.user.id)
    
    if (!userWithSubscription?.subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    const subscriptionId = userWithSubscription.subscription.stripe_subscription_id
    let updatedSubscription = null

    switch (action) {
      case 'cancel':
        updatedSubscription = await cancelSubscription(subscriptionId, cancelAtPeriodEnd)
        break

      case 'reactivate':
        updatedSubscription = await reactivateSubscription(subscriptionId)
        break

      case 'change_plan':
        if (!planId) {
          return NextResponse.json(
            { error: 'Plan ID is required for plan changes' },
            { status: 400 }
          )
        }
        updatedSubscription = await updateSubscriptionPlan(subscriptionId, planId as SubscriptionPlan)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: `Failed to ${action} subscription` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
          canceledAt: updatedSubscription.canceled_at ? new Date(updatedSubscription.canceled_at * 1000) : null
        }
      },
      message: `Subscription ${action} successful`
    })

  } catch (error) {
    console.error('Update Subscription API Error:', error)
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such subscription')) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update subscription'
      },
      { status: 500 }
    )
  }
}

// DELETE - Cancel subscription immediately
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get user with subscription info
    const userWithSubscription = await userModel.findWithProgressAndSubscription(session.user.id)
    
    if (!userWithSubscription?.subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription immediately
    const canceledSubscription = await cancelSubscription(
      userWithSubscription.subscription.stripe_subscription_id,
      false // Cancel immediately
    )

    if (!canceledSubscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled immediately'
    })

  } catch (error) {
    console.error('Delete Subscription API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel subscription'
      },
      { status: 500 }
    )
  }
}