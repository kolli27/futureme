import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { visionModel } from '@/lib/db/models/vision'
import { VisionCategory } from '@/lib/db/types'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const includeAiAnalysis = searchParams.get('includeAiAnalysis') === 'true'

    let result
    if (includeAiAnalysis) {
      result = await visionModel.findWithAiAnalysis(params.id, session.user.id)
    } else {
      const vision = await visionModel.findByIdForUser(params.id, session.user.id)
      result = vision ? { vision, aiAnalysis: null } : null
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Vision not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get Vision API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve vision'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { category, title, description, priority, timeAllocation, isActive } = body

    // Validate category if provided
    if (category) {
      const validCategories: VisionCategory[] = ['health', 'career', 'relationships', 'personal-growth']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category. Must be one of: health, career, relationships, personal-growth' },
          { status: 400 }
        )
      }
    }

    // Validate description if provided
    if (description && (description.length < 10 || description.length > 2000)) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 2000 characters' },
        { status: 400 }
      )
    }

    // Update vision
    const vision = await visionModel.update(params.id, session.user.id, {
      category,
      title: title || undefined,
      description: description?.trim(),
      priority,
      time_allocation_minutes: timeAllocation,
      is_active: isActive
    })

    if (!vision) {
      return NextResponse.json(
        { error: 'Vision not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vision,
      message: 'Vision updated successfully'
    })

  } catch (error) {
    console.error('Update Vision API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update vision'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Delete vision
    const deleted = await visionModel.delete(params.id, session.user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Vision not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vision deleted successfully'
    })

  } catch (error) {
    console.error('Delete Vision API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete vision'
      },
      { status: 500 }
    )
  }
}