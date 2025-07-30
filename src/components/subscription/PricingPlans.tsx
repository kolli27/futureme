'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe'
import { getPlanComparison } from '@/utils/subscriptionUtils'

interface PricingPlansProps {
  onPlanSelect?: (planId: string) => void
  currentPlan?: string
  showCurrentPlan?: boolean
}

export function PricingPlans({ 
  onPlanSelect, 
  currentPlan, 
  showCurrentPlan = true 
}: PricingPlansProps) {
  const { createCheckout, isLoading, effectivePlan } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  
  const plans = getPlanComparison()

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      onPlanSelect?.(planId)
      return
    }

    setSelectedPlan(planId)
    
    try {
      const result = await createCheckout(planId as any)
      if (!result.success) {
        console.error('Failed to create checkout:', result.error)
        // Handle error - could show a toast notification
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setSelectedPlan(null)
    }
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Transform your life with personalized AI-powered daily actions
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = showCurrentPlan && effectivePlan === plan.id
            const isPopular = plan.recommended
            const isLoading = selectedPlan === plan.id
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-lg shadow-md ${
                  isPopular
                    ? 'border-2 border-blue-500 shadow-blue-100'
                    : 'border border-gray-200'
                } bg-white overflow-hidden`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="px-6 py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(0)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-lg font-medium text-gray-500 ml-1">
                          /year
                        </span>
                      )}
                    </div>
                    {plan.price > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${((plan.price / 100) / 12).toFixed(2)}/month
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrentPlan ? (
                      <div className="w-full py-3 px-4 rounded-md text-center text-sm font-medium text-gray-500 bg-gray-100">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-md text-center text-sm font-medium transition-colors ${
                          isPopular
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            : 'bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                        } ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </div>
                        ) : plan.id === 'free' ? (
                          'Get Started'
                        ) : (
                          'Subscribe Now'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}