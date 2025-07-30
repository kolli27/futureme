/**
 * Subscription Management Hook
 * 
 * Client-side hook for managing user subscriptions, including
 * fetching subscription data, creating checkout sessions, and
 * managing subscription state.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { SubscriptionPlan } from '@/lib/stripe'
import { 
  UserSubscription, 
  getEffectivePlan, 
  hasActiveSubscription,
  getSubscriptionStatusInfo,
  canPerformAction,
  shouldShowUpgradePrompt
} from '@/utils/subscriptionUtils'

interface SubscriptionData {
  plan: SubscriptionPlan
  status: string | null
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  subscription?: any
}

interface SubscriptionUsage {
  visionCount: number
  dailyAiCalls: number
  monthlyAiCalls: number
}

export function useSubscription() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<SubscriptionUsage>({ visionCount: 0, dailyAiCalls: 0, monthlyAiCalls: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/subscription')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch subscription')
      }

      if (result.success) {
        setSubscriptionData(result.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription'
      setError(errorMessage)
      console.error('Fetch subscription error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Create checkout session
  const createCheckout = useCallback(async (
    planId: SubscriptionPlan,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to continue' }
    }

    setIsLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const defaultSuccessUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
      const defaultCancelUrl = `${baseUrl}/subscription/cancelled`

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: successUrl || defaultSuccessUrl,
          cancelUrl: cancelUrl || defaultCancelUrl
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      if (result.success && result.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url
        return { success: true, url: result.data.url }
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session'
      setError(errorMessage)
      console.error('Create checkout error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Open customer portal
  const openCustomerPortal = useCallback(async (returnUrl?: string): Promise<boolean> => {
    if (!session?.user?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const defaultReturnUrl = `${baseUrl}/subscription`

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: returnUrl || defaultReturnUrl
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to open customer portal')
      }

      if (result.success && result.data.url) {
        window.open(result.data.url, '_blank')
        return true
      } else {
        throw new Error('No portal URL received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open customer portal'
      setError(errorMessage)
      console.error('Open customer portal error:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Cancel subscription
  const cancelSubscription = useCallback(async (cancelAtPeriodEnd: boolean = true): Promise<boolean> => {
    if (!session?.user?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          cancelAtPeriodEnd
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription')
      }

      if (result.success) {
        // Refresh subscription data
        await fetchSubscription()
        return true
      }

      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(errorMessage)
      console.error('Cancel subscription error:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, fetchSubscription])

  // Reactivate subscription
  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reactivate'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reactivate subscription')
      }

      if (result.success) {
        // Refresh subscription data
        await fetchSubscription()
        return true
      }

      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate subscription'
      setError(errorMessage)
      console.error('Reactivate subscription error:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, fetchSubscription])

  // Fetch subscription data when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription()
    }
  }, [session?.user?.id, fetchSubscription])

  // Convert subscription data to UserSubscription format
  const userSubscription: UserSubscription | null = subscriptionData ? {
    plan: subscriptionData.plan,
    status: subscriptionData.status as any || 'active',
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
    stripeCustomerId: subscriptionData.stripeCustomerId
  } : null

  // Computed values
  const effectivePlan = getEffectivePlan(userSubscription)
  const isActive = hasActiveSubscription(userSubscription)
  const statusInfo = getSubscriptionStatusInfo(userSubscription)
  const showUpgradePrompt = shouldShowUpgradePrompt(userSubscription, usage)

  // Permission checks
  const canCreateVision = canPerformAction(userSubscription, 'create_vision', usage)
  const canUseAI = canPerformAction(userSubscription, 'use_ai', usage)
  const canAccessAnalytics = canPerformAction(userSubscription, 'access_analytics', usage)

  return {
    // Data
    subscription: userSubscription,
    subscriptionData,
    usage,
    effectivePlan,
    isActive,
    statusInfo,

    // State
    isLoading,
    error,

    // Actions
    fetchSubscription,
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
    reactivateSubscription,
    setUsage,

    // Permissions
    canCreateVision,
    canUseAI,
    canAccessAnalytics,
    showUpgradePrompt,

    // Helpers
    hasActiveSubscription: isActive,
    isPro: effectivePlan === 'pro',
    isEnterprise: effectivePlan === 'enterprise',
    isFree: effectivePlan === 'free'
  }
}