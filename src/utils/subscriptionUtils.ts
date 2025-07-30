/**
 * Subscription Utilities
 * 
 * Client-side utilities for subscription management, plan validation,
 * and freemium limitations enforcement.
 */

import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe'

export interface UserSubscription {
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(subscription: UserSubscription | null): boolean {
  if (!subscription) return false
  
  return subscription.status === 'active' || 
         subscription.status === 'trialing' ||
         (subscription.status === 'cancelled' && 
          subscription.currentPeriodEnd && 
          subscription.currentPeriodEnd > new Date())
}

/**
 * Check if user has a specific subscription plan or higher
 */
export function hasSubscriptionPlan(
  subscription: UserSubscription | null, 
  requiredPlan: SubscriptionPlan
): boolean {
  if (!subscription || !hasActiveSubscription(subscription)) {
    return requiredPlan === 'free'
  }

  const planHierarchy: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 1,
    enterprise: 2
  }

  return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan]
}

/**
 * Get user's effective plan (considering subscription status)
 */
export function getEffectivePlan(subscription: UserSubscription | null): SubscriptionPlan {
  if (!subscription || !hasActiveSubscription(subscription)) {
    return 'free'
  }
  
  return subscription.plan
}

/**
 * Get plan limits for a subscription plan
 */
export function getPlanLimits(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan].limits
}

/**
 * Check if user can perform an action based on their plan limits
 */
export function canPerformAction(
  subscription: UserSubscription | null,
  action: 'create_vision' | 'use_ai' | 'access_analytics',
  currentUsage?: {
    visionCount?: number
    dailyAiCalls?: number
    monthlyAiCalls?: number
  }
): {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  limit?: number
  current?: number
} {
  const effectivePlan = getEffectivePlan(subscription)
  const limits = getPlanLimits(effectivePlan)

  switch (action) {
    case 'create_vision':
      const visionCount = currentUsage?.visionCount || 0
      const allowed = visionCount < limits.maxVisions
      
      return {
        allowed,
        reason: allowed ? undefined : `Vision limit reached for ${effectivePlan} plan`,
        upgradeRequired: !allowed && effectivePlan === 'free',
        limit: limits.maxVisions,
        current: visionCount
      }

    case 'use_ai':
      const dailyAiCalls = currentUsage?.dailyAiCalls || 0
      const monthlyAiCalls = currentUsage?.monthlyAiCalls || 0
      
      // Check daily limit first
      if (dailyAiCalls >= limits.dailyAiCalls) {
        return {
          allowed: false,
          reason: `Daily AI limit reached for ${effectivePlan} plan (${limits.dailyAiCalls} calls/day)`,
          upgradeRequired: effectivePlan === 'free',
          limit: limits.dailyAiCalls,
          current: dailyAiCalls
        }
      }
      
      // Check monthly limit
      if (monthlyAiCalls >= limits.monthlyAiCalls) {
        return {
          allowed: false,
          reason: `Monthly AI limit reached for ${effectivePlan} plan (${limits.monthlyAiCalls} calls/month)`,
          upgradeRequired: effectivePlan === 'free',
          limit: limits.monthlyAiCalls,
          current: monthlyAiCalls
        }
      }
      
      return { allowed: true }

    case 'access_analytics':
      const hasAccess = effectivePlan !== 'free'
      return {
        allowed: hasAccess,
        reason: hasAccess ? undefined : 'Advanced analytics require Pro plan or higher',
        upgradeRequired: !hasAccess
      }

    default:
      return { allowed: true }
  }
}

/**
 * Get subscription status display info
 */
export function getSubscriptionStatusInfo(subscription: UserSubscription | null): {
  status: string
  color: 'green' | 'yellow' | 'red' | 'gray'
  description: string
  action?: string
} {
  if (!subscription) {
    return {
      status: 'Free Plan',
      color: 'gray',
      description: 'Limited features available',
      action: 'Upgrade to Pro'
    }
  }

  const effectivePlan = getEffectivePlan(subscription)
  const planName = SUBSCRIPTION_PLANS[effectivePlan].name

  switch (subscription.status) {
    case 'active':
      if (subscription.cancelAtPeriodEnd) {
        const endDate = subscription.currentPeriodEnd?.toLocaleDateString()
        return {
          status: `${planName} (Cancelling)`,
          color: 'yellow',
          description: `Your subscription will end on ${endDate}`,
          action: 'Reactivate'
        }
      }
      return {
        status: `${planName} Plan`,
        color: 'green',
        description: 'Your subscription is active'
      }

    case 'trialing':
      const trialEnd = subscription.currentPeriodEnd?.toLocaleDateString()
      return {
        status: `${planName} Trial`,
        color: 'green',
        description: `Trial ends on ${trialEnd}`
      }

    case 'past_due':
      return {
        status: 'Payment Required',
        color: 'red',
        description: 'Your payment is past due',
        action: 'Update Payment'
      }

    case 'cancelled':
      return {
        status: 'Cancelled',
        color: 'gray',
        description: 'Your subscription has been cancelled',
        action: 'Resubscribe'
      }

    default:
      return {
        status: 'Free Plan',
        color: 'gray',
        description: 'Limited features available',
        action: 'Upgrade to Pro'
      }
  }
}

/**
 * Get upgrade recommendations based on usage
 */
export function getUpgradeRecommendation(
  subscription: UserSubscription | null,
  usage: {
    visionCount: number
    dailyAiCalls: number
    monthlyAiCalls: number
  }
): {
  shouldUpgrade: boolean
  recommendedPlan?: SubscriptionPlan
  reasons: string[]
} {
  const effectivePlan = getEffectivePlan(subscription)
  
  if (effectivePlan === 'enterprise') {
    return { shouldUpgrade: false, reasons: [] }
  }

  const reasons: string[] = []
  let recommendedPlan: SubscriptionPlan = 'pro'

  // Check vision limits
  const visionCheck = canPerformAction(subscription, 'create_vision', usage)
  if (!visionCheck.allowed) {
    reasons.push(`You've reached the vision limit (${visionCheck.current}/${visionCheck.limit})`)
  }

  // Check AI usage
  const aiCheck = canPerformAction(subscription, 'use_ai', usage)
  if (!aiCheck.allowed) {
    reasons.push(`You've reached AI usage limits`)
  }

  // Recommend enterprise for heavy usage
  if (usage.visionCount > SUBSCRIPTION_PLANS.pro.limits.maxVisions * 0.8 || 
      usage.monthlyAiCalls > SUBSCRIPTION_PLANS.pro.limits.monthlyAiCalls * 0.8) {
    recommendedPlan = 'enterprise'
    reasons.push('Consider Enterprise for unlimited features')
  }

  return {
    shouldUpgrade: reasons.length > 0,
    recommendedPlan: reasons.length > 0 ? recommendedPlan : undefined,
    reasons
  }
}

/**
 * Calculate days until subscription ends
 */
export function getDaysUntilRenewal(subscription: UserSubscription | null): number | null {
  if (!subscription?.currentPeriodEnd) return null
  
  const now = new Date()
  const endDate = subscription.currentPeriodEnd
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

/**
 * Format subscription price for display
 */
export function formatSubscriptionPrice(plan: SubscriptionPlan): string {
  const planInfo = SUBSCRIPTION_PLANS[plan]
  
  if (planInfo.price === 0) {
    return 'Free'
  }
  
  const annual = planInfo.price / 100 // Convert cents to dollars
  const monthly = annual / 12
  
  return `$${annual}/year ($${monthly.toFixed(2)}/month)`
}

/**
 * Get plan comparison for upgrade flows
 */
export function getPlanComparison() {
  return Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => ({
    id: planId as SubscriptionPlan,
    name: plan.name,
    price: plan.price,
    priceFormatted: formatSubscriptionPrice(planId as SubscriptionPlan),
    features: plan.features,
    limits: plan.limits,
    recommended: planId === 'pro'
  }))
}

/**
 * Check if it's a good time to show upgrade prompt
 */
export function shouldShowUpgradePrompt(
  subscription: UserSubscription | null,
  usage: {
    visionCount: number
    dailyAiCalls: number
    monthlyAiCalls: number
  },
  lastPromptShown?: Date
): boolean {
  // Don't show if user already has active subscription
  if (hasActiveSubscription(subscription) && subscription?.plan !== 'free') {
    return false
  }

  // Don't show too frequently (max once per day)
  if (lastPromptShown) {
    const daysSinceLastPrompt = (Date.now() - lastPromptShown.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastPrompt < 1) {
      return false
    }
  }

  // Show if user is hitting limits
  const visionCheck = canPerformAction(subscription, 'create_vision', usage)
  const aiCheck = canPerformAction(subscription, 'use_ai', usage)
  
  // Show if at 80% of limits or blocked
  const visionUsageRatio = (usage.visionCount / getPlanLimits('free').maxVisions)
  const aiUsageRatio = (usage.dailyAiCalls / getPlanLimits('free').dailyAiCalls)
  
  return !visionCheck.allowed || 
         !aiCheck.allowed || 
         visionUsageRatio >= 0.8 || 
         aiUsageRatio >= 0.8
}