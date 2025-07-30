import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { visionModel } from '@/lib/db/models/vision'
import { VisionCategory } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'
    const category = searchParams.get('category') as VisionCategory | null

    // Get visions for user
    let visions
    if (category) {
      visions = await visionModel.findByCategory(session.user.id, category)
    } else {
      visions = await visionModel.findByUserId(session.user.id, activeOnly)
    }

    return NextResponse.json({
      success: true,
      data: visions,
      count: visions.length
    })

  } catch (error) {
    console.error('Get Visions API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve visions'
      },
      { status: 500 }
    )
  }
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

    // Parse request body
    const body = await request.json()
    const { category, title, description, priority, timeAllocation } = body

    // Validate required fields
    if (!category || !description) {
      return NextResponse.json(
        { error: 'Category and description are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories: VisionCategory[] = ['health', 'career', 'relationships', 'personal-growth']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: health, career, relationships, personal-growth' },
        { status: 400 }
      )
    }

    // Validate description length
    if (description.length < 10 || description.length > 2000) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 2000 characters' },
        { status: 400 }
      )
    }

    // Check if user has reached vision limit (freemium restriction)
    const activeVisionCount = await visionModel.countActiveForUser(session.user.id)
    const userPlan = session.user.subscriptionPlan || 'free'
    
    const visionLimits = {
      free: 2,
      pro: 10,
      enterprise: 50
    }

    if (activeVisionCount >= visionLimits[userPlan]) {
      return NextResponse.json(
        { 
          error: `Vision limit reached for ${userPlan} plan (${visionLimits[userPlan]} visions max)`,
          upgradeRequired: userPlan === 'free',
          currentCount: activeVisionCount,
          limit: visionLimits[userPlan]
        },
        { status: 403 }
      )
    }

    // Create vision
    const vision = await visionModel.create({
      user_id: session.user.id,
      category,
      title: title || null,
      description: description.trim(),
      priority: priority || 1,
      time_allocation_minutes: timeAllocation || 30
    })

    return NextResponse.json({
      success: true,
      data: vision,
      message: 'Vision created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create Vision API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create vision'
      },
      { status: 500 }
    )
  }
}