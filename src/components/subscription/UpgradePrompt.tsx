'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { getPlanLimits } from '@/utils/subscriptionUtils'

interface UpgradePromptProps {
  trigger: 'vision_limit' | 'ai_limit' | 'analytics_access'
  onClose?: () => void
  onUpgrade?: () => void
  currentCount?: number
  limit?: number
}

export function UpgradePrompt({ 
  trigger, 
  onClose, 
  onUpgrade,
  currentCount,
  limit 
}: UpgradePromptProps) {
  const { createCheckout, isLoading, effectivePlan } = useSubscription()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    
    try {
      const result = await createCheckout('pro')
      if (result.success) {
        onUpgrade?.()
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const getPromptContent = () => {
    const proLimits = getPlanLimits('pro')
    
    switch (trigger) {
      case 'vision_limit':
        return {
          title: 'Vision Limit Reached',
          description: `You've reached the maximum of ${limit} visions for the free plan. Upgrade to Pro to create up to ${proLimits.maxVisions} visions and unlock premium features.`,
          icon: '🎯'
        }
      
      case 'ai_limit':
        return {
          title: 'AI Usage Limit Reached',
          description: `You've used all your daily AI calls (${limit}). Upgrade to Pro for ${proLimits.dailyAiCalls} daily AI calls and advanced insights.`,
          icon: '🤖'
        }
      
      case 'analytics_access':
        return {
          title: 'Premium Feature',
          description: 'Advanced analytics and insights are available with Pro plan. Get detailed progress tracking and AI-powered recommendations.',
          icon: '📊'
        }
      
      default:
        return {
          title: 'Upgrade to Pro',
          description: 'Unlock all features with our Pro subscription.',
          icon: '⭐'
        }
    }
  }

  const content = getPromptContent()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-2xl">
              {content.icon}
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {content.title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          {/* Pro plan benefits */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              Pro Plan Benefits:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Up to 10 visions (vs 2 free)
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                200 daily AI calls (vs 20 free)
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced analytics & insights
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">$29.99/year</div>
            <div className="text-sm text-gray-500">Just $2.50/month • 14-day free trial</div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpgrading ? (
                <div className="flex items-center">
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
                  Upgrading...
                </div>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}