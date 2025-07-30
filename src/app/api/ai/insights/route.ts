import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generatePersonalizedInsights } from '@/lib/ai'
import { checkAIQuota, trackAIUsage } from '@/lib/ai-middleware'

interface UserStatsRequest {
  completionRate: number
  averageCompletionTime: number
  streakCount: number
  preferredTimes: number[]
  visionProgress: { [visionId: string]: number }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Check AI usage quotas
    const quotaCheck = await checkAIQuota(
      session.user.id,
      session.user.subscriptionPlan || 'free'
    )
    
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { 
          success: false,
          error: quotaCheck.reason,
          quotaExceeded: true,
          remainingDaily: quotaCheck.remainingDaily,
          remainingMonthly: quotaCheck.remainingMonthly
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const userStats: UserStatsRequest = body.userStats

    // Validate request data
    if (!userStats || typeof userStats !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request - userStats object required' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['completionRate', 'averageCompletionTime', 'streakCount']
    for (const field of requiredFields) {
      if (typeof userStats[field as keyof UserStatsRequest] !== 'number') {
        return NextResponse.json(
          { error: `Invalid request - ${field} must be a number` },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(userStats.preferredTimes)) {
      return NextResponse.json(
        { error: 'Invalid request - preferredTimes must be an array' },
        { status: 400 }
      )
    }

    if (!userStats.visionProgress || typeof userStats.visionProgress !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request - visionProgress must be an object' },
        { status: 400 }
      )
    }

    // Generate AI insights with proper user ID from session
    const response = await generatePersonalizedInsights(
      userStats,
      session.user.id
    )

    // Track AI usage for monitoring and cost management
    trackAIUsage(
      session.user.id,
      '/api/ai/insights',
      'gpt-4o-mini',
      400, // Estimated tokens
      response.success,
      response.cached || false
    )

    // Return response
    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Insights API Error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error - AI service temporarily unavailable',
        data: {
          recommendations: [],
          insights: []
        }
      },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - Use POST' },
    { status: 405 }
  )
}