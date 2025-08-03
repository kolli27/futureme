/**
 * Stripe Integration Library
 * 
 * Handles all Stripe-related functionality including subscription management,
 * customer creation, checkout sessions, and webhook processing.
 */

import Stripe from 'stripe'

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: [
      '2 visions maximum',
      'Basic AI features',
      '20 AI calls per day',
      'Personal progress tracking'
    ],
    limits: {
      maxVisions: 2,
      dailyAiCalls: 20,
      monthlyAiCalls: 300
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2999, // $29.99 in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID, // Set in environment
    features: [
      '10 visions maximum',
      'Full AI features',
      '200 AI calls per day',
      'Advanced analytics',
      'Progress insights',
      'Priority support'
    ],
    limits: {
      maxVisions: 10,
      dailyAiCalls: 200,
      monthlyAiCalls: 3000
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999, // $99.99 in cents
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID, // Set in environment
    features: [
      'Unlimited visions',
      'Enterprise AI features',
      '1000 AI calls per day',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support'
    ],
    limits: {
      maxVisions: 50,
      dailyAiCalls: 1000,
      monthlyAiCalls: 10000
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  userId: string
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        source: 'futureme-app'
      }
    })

    return customer
  } catch (error) {
    console.error('Failed to create Stripe customer:', error)
    throw new Error('Failed to create customer')
  }
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  userId: string,
  existingCustomerId?: string
): Promise<Stripe.Customer> {
  try {
    // If we have an existing customer ID, try to retrieve it
    if (existingCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(existingCustomerId)
        if (customer && !customer.deleted) {
          return customer as Stripe.Customer
        }
      } catch (error) {
        console.warn('Existing customer not found, creating new one:', error)
      }
    }

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0]
      // Update metadata to include userId
      await stripe.customers.update(customer.id, {
        metadata: {
          userId,
          source: 'futureme-app'
        }
      })
      return customer
    }

    // Create new customer
    return await createStripeCustomer(email, name, userId)
  } catch (error) {
    console.error('Failed to get or create Stripe customer:', error)
    throw new Error('Failed to get or create customer')
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  planId: SubscriptionPlan,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    const plan = SUBSCRIPTION_PLANS[planId]
    
    if (!plan.stripePriceId) {
      throw new Error(`No Stripe price ID configured for ${planId} plan`)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        source: 'futureme-app'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    return session
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Failed to create billing portal session:', error)
    throw new Error('Failed to create billing portal session')
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'customer']
    })

    return subscription
  } catch (error) {
    console.error('Failed to get subscription:', error)
    return null
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription | null> {
  try {
    if (cancelAtPeriodEnd) {
      // Cancel at period end (recommended)
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString()
        }
      })
      return subscription
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId)
      return subscription
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    return null
  }
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      metadata: {
        reactivated_by: 'user',
        reactivated_at: new Date().toISOString()
      }
    })

    return subscription
  } catch (error) {
    console.error('Failed to reactivate subscription:', error)
    return null
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlanId: SubscriptionPlan
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const newPlan = SUBSCRIPTION_PLANS[newPlanId]

    if (!newPlan.stripePriceId) {
      throw new Error(`No Stripe price ID configured for ${newPlanId} plan`)
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPlan.stripePriceId,
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        ...subscription.metadata,
        upgraded_to: newPlanId,
        upgraded_at: new Date().toISOString()
      }
    })

    return updatedSubscription
  } catch (error) {
    console.error('Failed to update subscription plan:', error)
    return null
  }
}

/**
 * Process webhook event
 */
export async function processWebhookEvent(
  event: Stripe.Event
): Promise<{
  success: boolean
  action?: string
  data?: any
  error?: string
}> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        return {
          success: true,
          action: 'subscription_updated',
          data: {
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planId: subscription.metadata?.planId || 'pro'
          }
        }

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        return {
          success: true,
          action: 'subscription_cancelled',
          data: {
            subscriptionId: deletedSubscription.id,
            customerId: deletedSubscription.customer as string
          }
        }

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        return {
          success: true,
          action: 'payment_succeeded',
          data: {
            subscriptionId: (invoice as any).subscription as string,
            customerId: invoice.customer as string,
            amountPaid: invoice.amount_paid,
            invoiceId: invoice.id
          }
        }

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        return {
          success: true,
          action: 'payment_failed',
          data: {
            subscriptionId: (failedInvoice as any).subscription as string,
            customerId: failedInvoice.customer as string,
            invoiceId: failedInvoice.id
          }
        }

      default:
        return {
          success: true,
          action: 'ignored',
          data: { eventType: event.type }
        }
    }
  } catch (error) {
    console.error('Failed to process webhook event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  body: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    console.error('Webhook signature validation failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Get subscription plan by Stripe price ID
 */
export function getPlanByStripePriceId(priceId: string): SubscriptionPlan | null {
  for (const [planId, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.stripePriceId === priceId) {
      return planId as SubscriptionPlan
    }
  }
  return null
}

/**
 * Format price for display
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Export types
export type { Stripe }
export type StripeCustomer = Stripe.Customer
export type StripeSubscription = Stripe.Subscription
export type StripeCheckoutSession = Stripe.Checkout.Session