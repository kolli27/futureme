// AI Middleware for cost tracking, monitoring, and user quotas
// This helps implement proper AI usage limits and cost management

interface AIUsageLog {
  userId: string
  endpoint: string
  model: string
  tokensUsed: number
  cost: number
  timestamp: Date
  success: boolean
  cached: boolean
}

interface UserQuota {
  userId: string
  monthlyTokensUsed: number
  monthlyApiCalls: number
  dailyApiCalls: number
  lastResetDate: Date
}

// In-memory storage for demonstration (in production, use Redis or database)
const usageCache = new Map<string, UserQuota>()
const dailyUsageCache = new Map<string, number>()

// AI Usage quotas by user type
const AI_QUOTAS = {
  free: {
    monthlyTokens: 50000,      // ~50K tokens per month for free users
    dailyApiCalls: 20,         // 20 AI calls per day
    monthlyApiCalls: 300       // 300 AI calls per month
  },
  pro: {
    monthlyTokens: 500000,     // ~500K tokens per month for pro users
    dailyApiCalls: 200,        // 200 AI calls per day
    monthlyApiCalls: 3000      // 3000 AI calls per month
  },
  enterprise: {
    monthlyTokens: 2000000,    // ~2M tokens per month for enterprise
    dailyApiCalls: 1000,       // 1000 AI calls per day
    monthlyApiCalls: 10000     // 10000 AI calls per month
  }
}

// Pricing per token (approximate OpenAI pricing)
const TOKEN_COSTS = {
  'gpt-4o-mini': {
    input: 0.00015 / 1000,    // $0.15 per 1M input tokens
    output: 0.0006 / 1000     // $0.60 per 1M output tokens
  },
  'gpt-4': {
    input: 0.03 / 1000,       // $30 per 1M input tokens
    output: 0.06 / 1000       // $60 per 1M output tokens
  }
}

export async function checkAIQuota(userId: string, userPlan: 'free' | 'pro' | 'enterprise' = 'free'): Promise<{
  allowed: boolean
  reason?: string
  remainingDaily?: number
  remainingMonthly?: number
}> {
  try {
    const now = new Date()
    const quota = AI_QUOTAS[userPlan]
    
    // Get or create user quota tracking
    let userQuota = usageCache.get(userId)
    if (!userQuota) {
      userQuota = {
        userId,
        monthlyTokensUsed: 0,
        monthlyApiCalls: 0,
        dailyApiCalls: 0,
        lastResetDate: now
      }
      usageCache.set(userId, userQuota)
    }

    // Reset counters if needed (monthly reset)
    const monthsDiff = (now.getFullYear() - userQuota.lastResetDate.getFullYear()) * 12 + 
                      (now.getMonth() - userQuota.lastResetDate.getMonth())
    
    if (monthsDiff >= 1) {
      userQuota.monthlyTokensUsed = 0
      userQuota.monthlyApiCalls = 0
      userQuota.lastResetDate = now
    }

    // Reset daily counter if needed
    const today = now.toISOString().split('T')[0]
    const dailyKey = `${userId}_${today}`
    if (!dailyUsageCache.has(dailyKey)) {
      dailyUsageCache.set(dailyKey, 0)
      userQuota.dailyApiCalls = 0
    }

    // Check daily limits
    if (userQuota.dailyApiCalls >= quota.dailyApiCalls) {
      return {
        allowed: false,
        reason: `Daily AI limit reached (${quota.dailyApiCalls} calls). Try again tomorrow.`,
        remainingDaily: 0,
        remainingMonthly: quota.monthlyApiCalls - userQuota.monthlyApiCalls
      }
    }

    // Check monthly limits
    if (userQuota.monthlyApiCalls >= quota.monthlyApiCalls) {
      return {
        allowed: false,
        reason: `Monthly AI limit reached (${quota.monthlyApiCalls} calls). Upgrade plan or wait for next month.`,
        remainingDaily: quota.dailyApiCalls - userQuota.dailyApiCalls,
        remainingMonthly: 0
      }
    }

    // Check token limits
    if (userQuota.monthlyTokensUsed >= quota.monthlyTokens) {
      return {
        allowed: false,
        reason: `Monthly token limit reached (${quota.monthlyTokens.toLocaleString()} tokens). Upgrade plan or wait for next month.`,
        remainingDaily: quota.dailyApiCalls - userQuota.dailyApiCalls,
        remainingMonthly: quota.monthlyApiCalls - userQuota.monthlyApiCalls
      }
    }

    return {
      allowed: true,
      remainingDaily: quota.dailyApiCalls - userQuota.dailyApiCalls,
      remainingMonthly: quota.monthlyApiCalls - userQuota.monthlyApiCalls
    }

  } catch (error) {
    console.error('AI Quota Check Error:', error)
    // On error, allow the request but log it
    return { allowed: true }
  }
}

export function trackAIUsage(
  userId: string,
  endpoint: string,
  model: string,
  tokensUsed: number,
  success: boolean,
  cached: boolean = false
): void {
  try {
    const cost = calculateCost(model, tokensUsed)
    
    // Update user quota tracking
    const userQuota = usageCache.get(userId)
    if (userQuota) {
      userQuota.monthlyTokensUsed += tokensUsed
      userQuota.monthlyApiCalls += 1
      userQuota.dailyApiCalls += 1
      
      // Update daily cache
      const today = new Date().toISOString().split('T')[0]
      const dailyKey = `${userId}_${today}`
      const currentDaily = dailyUsageCache.get(dailyKey) || 0
      dailyUsageCache.set(dailyKey, currentDaily + 1)
    }

    // Log usage for monitoring and analytics
    const usageLog: AIUsageLog = {
      userId,
      endpoint,
      model,
      tokensUsed,
      cost,
      timestamp: new Date(),
      success,
      cached
    }

    // In production, this would be sent to a logging service or database
    console.log('AI Usage:', usageLog)

    // Optional: Send to analytics service
    // await sendToAnalytics('ai_usage', usageLog)

  } catch (error) {
    console.error('AI Usage Tracking Error:', error)
  }
}

function calculateCost(model: string, tokensUsed: number): number {
  const pricing = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS]
  if (!pricing) {
    return 0 // Unknown model
  }
  
  // Approximate 70% input tokens, 30% output tokens
  const inputTokens = Math.floor(tokensUsed * 0.7)
  const outputTokens = tokensUsed - inputTokens
  
  return (inputTokens * pricing.input) + (outputTokens * pricing.output)
}

export function getAIUsageStats(userId: string): {
  dailyApiCalls: number
  monthlyApiCalls: number
  monthlyTokensUsed: number
  estimatedMonthlyCost: number
  quotaStatus: 'healthy' | 'warning' | 'critical'
} {
  const userQuota = usageCache.get(userId)
  if (!userQuota) {
    return {
      dailyApiCalls: 0,
      monthlyApiCalls: 0,
      monthlyTokensUsed: 0,
      estimatedMonthlyCost: 0,
      quotaStatus: 'healthy'
    }
  }

  const monthlyCost = calculateCost('gpt-4o-mini', userQuota.monthlyTokensUsed)
  
  // Determine quota status
  let quotaStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
  const freeQuota = AI_QUOTAS.free
  
  if (userQuota.monthlyApiCalls > freeQuota.monthlyApiCalls * 0.8 || 
      userQuota.monthlyTokensUsed > freeQuota.monthlyTokens * 0.8) {
    quotaStatus = 'warning'
  }
  
  if (userQuota.monthlyApiCalls > freeQuota.monthlyApiCalls * 0.95 || 
      userQuota.monthlyTokensUsed > freeQuota.monthlyTokens * 0.95) {
    quotaStatus = 'critical'
  }

  return {
    dailyApiCalls: userQuota.dailyApiCalls,
    monthlyApiCalls: userQuota.monthlyApiCalls,
    monthlyTokensUsed: userQuota.monthlyTokensUsed,
    estimatedMonthlyCost: monthlyCost,
    quotaStatus
  }
}

// Export types for external use
export type { AIUsageLog, UserQuota }