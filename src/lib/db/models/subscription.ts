/**
 * User Subscription Database Model
 * Handles subscription management, billing, and plan tracking
 */

import { Pool } from 'pg'
import { DbUserSubscription, SubscriptionPlan, SubscriptionStatus } from '../types'

export class UserSubscriptionRepository {
  constructor(private db: Pool) {}

  async findByUserId(userId: string): Promise<DbUserSubscription | null> {
    const result = await this.db.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [userId]
    )
    return result.rows[0] || null
  }

  async findByStripeCustomerId(customerId: string): Promise<DbUserSubscription | null> {
    const result = await this.db.query(
      'SELECT * FROM user_subscriptions WHERE stripe_customer_id = $1',
      [customerId]
    )
    return result.rows[0] || null
  }

  async findByStripeSubscriptionId(subscriptionId: string): Promise<DbUserSubscription | null> {
    const result = await this.db.query(
      'SELECT * FROM user_subscriptions WHERE stripe_subscription_id = $1',
      [subscriptionId]
    )
    return result.rows[0] || null
  }

  async create(input: Omit<DbUserSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<DbUserSubscription> {
    const result = await this.db.query(
      `INSERT INTO user_subscriptions 
       (user_id, organization_id, plan, status, stripe_subscription_id, stripe_customer_id,
        current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.user_id,
        input.organization_id,
        input.plan,
        input.status,
        input.stripe_subscription_id,
        input.stripe_customer_id,
        input.current_period_start,
        input.current_period_end,
        input.cancel_at_period_end,
        input.canceled_at,
        input.trial_ends_at
      ]
    )
    return result.rows[0]
  }

  async update(id: string, updates: Partial<DbUserSubscription>): Promise<DbUserSubscription> {
    const fields = Object.keys(updates).filter(key => key !== 'id')
    const values = fields.map(field => updates[field as keyof DbUserSubscription])
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const result = await this.db.query(
      `UPDATE user_subscriptions 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    )
    return result.rows[0]
  }

  async createOrUpdateFromStripe(
    userId: string,
    stripeData: {
      subscriptionId: string
      customerId: string
      plan: SubscriptionPlan
      status: SubscriptionStatus
      currentPeriodStart: Date
      currentPeriodEnd: Date
      cancelAtPeriodEnd: boolean
      canceledAt?: Date
    }
  ): Promise<DbUserSubscription> {
    const existing = await this.findByStripeSubscriptionId(stripeData.subscriptionId)
    
    const subscriptionData = {
      user_id: userId,
      plan: stripeData.plan,
      status: stripeData.status,
      stripe_subscription_id: stripeData.subscriptionId,
      stripe_customer_id: stripeData.customerId,
      current_period_start: stripeData.currentPeriodStart,
      current_period_end: stripeData.currentPeriodEnd,
      cancel_at_period_end: stripeData.cancelAtPeriodEnd,
      canceled_at: stripeData.canceledAt,
      organization_id: undefined,
      trial_ends_at: undefined
    }

    if (existing) {
      return this.update(existing.id, subscriptionData)
    } else {
      return this.create(subscriptionData)
    }
  }

  async cancelSubscription(userId: string): Promise<DbUserSubscription | null> {
    const subscription = await this.findByUserId(userId)
    if (!subscription) return null

    return this.update(subscription.id, {
      status: 'canceled' as SubscriptionStatus,
      canceled_at: new Date()
    })
  }

  async reactivateSubscription(userId: string): Promise<DbUserSubscription | null> {
    const subscription = await this.findByUserId(userId)
    if (!subscription) return null

    return this.update(subscription.id, {
      status: 'active' as SubscriptionStatus,
      canceled_at: undefined
    })
  }
}