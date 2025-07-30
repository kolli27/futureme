import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dailyActionModel } from '@/lib/db/models/dailyAction'
import { ActionStatus } from '@/lib/db/types'

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

    // Get the action
    const action = await dailyActionModel.findByIdForUser(params.id, session.user.id)

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: action
    })

  } catch (error) {
    console.error('Get Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve action'
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
    const { description, estimatedTime, actualTime, status } = body

    // Validate description if provided
    if (description && (description.length < 3 || description.length > 500)) {
      return NextResponse.json(
        { error: 'Description must be between 3 and 500 characters' },
        { status: 400 }
      )
    }

    // Validate estimated time if provided
    if (estimatedTime !== undefined && (estimatedTime < 1 || estimatedTime > 480)) {
      return NextResponse.json(
        { error: 'Estimated time must be between 1 and 480 minutes' },
        { status: 400 }
      )
    }

    // Validate actual time if provided
    if (actualTime !== undefined && (actualTime < 0 || actualTime > 960)) {
      return NextResponse.json(
        { error: 'Actual time must be between 0 and 960 minutes' },
        { status: 400 }
      )
    }

    // Validate status if provided
    const validStatuses: ActionStatus[] = ['pending', 'in_progress', 'completed', 'skipped']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, in_progress, completed, skipped' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (description) updateData.description = description.trim()
    if (estimatedTime !== undefined) updateData.estimated_time_minutes = estimatedTime
    if (actualTime !== undefined) updateData.actual_time_minutes = actualTime
    if (status) {
      updateData.status = status
      if (status === 'completed' && !updateData.completed_at) {
        updateData.completed_at = new Date()
      } else if (status !== 'completed') {
        updateData.completed_at = null
      }
    }

    // Update action
    const action = await dailyActionModel.update(params.id, session.user.id, updateData)

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: action,
      message: 'Action updated successfully'
    })

  } catch (error) {
    console.error('Update Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update action'
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

    // Delete action
    const deleted = await dailyActionModel.delete(params.id, session.user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Action not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Action deleted successfully'
    })

  } catch (error) {
    console.error('Delete Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete action'
      },
      { status: 500 }
    )
  }
}