import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateDailyActions } from '@/lib/ai'
import { checkAIQuota, trackAIUsage } from '@/lib/ai-middleware'
import { Vision } from '@/types'

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
        { status: 429 } // Too Many Requests
      )
    }

    // Parse request body
    const body = await request.json()
    const { visions, userBehaviorData } = body

    // Validate request data
    if (!Array.isArray(visions) || visions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - visions array required' },
        { status: 400 }
      )
    }

    // Validate vision objects
    for (const vision of visions) {
      if (!vision.id || !vision.category || !vision.description) {
        return NextResponse.json(
          { error: 'Invalid vision data - id, category, and description required' },
          { status: 400 }
        )
      }
    }

    // Generate AI actions with proper user ID from session
    const response = await generateDailyActions(
      visions as Vision[],
      session.user.id,
      userBehaviorData
    )

    // Track AI usage for monitoring and cost management
    trackAIUsage(
      session.user.id,
      '/api/ai/generate-actions',
      'gpt-4o-mini',
      500, // Estimated tokens (could be calculated from actual response)
      response.success,
      response.cached || false
    )

    // Return response
    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Generate Actions API Error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error - AI service temporarily unavailable',
        data: [] // Empty fallback data
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