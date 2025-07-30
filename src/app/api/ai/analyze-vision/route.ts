import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeVisionDescription } from '@/lib/ai'
import { checkAIQuota, trackAIUsage } from '@/lib/ai-middleware'

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
    const { visionDescription, category } = body

    // Validate request data
    if (!visionDescription || typeof visionDescription !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request - visionDescription string required' },
        { status: 400 }
      )
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request - category string required' },
        { status: 400 }
      )
    }

    // Validate description length (reasonable limits)
    if (visionDescription.length < 10) {
      return NextResponse.json(
        { error: 'Vision description too short - minimum 10 characters' },
        { status: 400 }
      )
    }

    if (visionDescription.length > 2000) {
      return NextResponse.json(
        { error: 'Vision description too long - maximum 2000 characters' },
        { status: 400 }
      )
    }

    // Generate AI vision analysis with proper user ID from session
    const response = await analyzeVisionDescription(
      visionDescription,
      category,
      session.user.id
    )

    // Track AI usage for monitoring and cost management
    trackAIUsage(
      session.user.id,
      '/api/ai/analyze-vision',
      'gpt-4o-mini',
      300, // Estimated tokens
      response.success,
      response.cached || false
    )

    // Return response
    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Vision Analysis API Error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error - AI service temporarily unavailable',
        data: {
          themes: [],
          keyGoals: [],
          suggestedActions: [],
          timeComplexity: 'medium',
          feasibilityScore: 0.8,
          improvements: []
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