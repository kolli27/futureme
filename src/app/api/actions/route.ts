import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dailyActionModel } from '@/lib/db/models/dailyAction'
import { ActionStatus } from '@/lib/db/types'

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
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const visionId = searchParams.get('visionId')
    const includeTimingSessions = searchParams.get('includeTimingSessions') === 'true'

    let actions

    if (date) {
      // Get actions for a specific date
      if (includeTimingSessions) {
        actions = await dailyActionModel.findWithTimingSessions(session.user.id, date)
      } else {
        actions = await dailyActionModel.findByUserAndDate(session.user.id, date)
      }
    } else if (startDate && endDate) {
      // Get actions for a date range
      actions = await dailyActionModel.findByUserAndDateRange(
        session.user.id, 
        startDate, 
        endDate
      )
    } else if (visionId) {
      // Get actions for a specific vision
      actions = await dailyActionModel.findByVision(visionId, session.user.id)
    } else {
      // Default: get today's actions
      const today = new Date().toISOString().split('T')[0]
      if (includeTimingSessions) {
        actions = await dailyActionModel.findWithTimingSessions(session.user.id, today)
      } else {
        actions = await dailyActionModel.findByUserAndDate(session.user.id, today)
      }
    }

    return NextResponse.json({
      success: true,
      data: actions,
      count: actions.length
    })

  } catch (error) {
    console.error('Get Actions API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve actions'
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
    const { 
      visionId, 
      description, 
      estimatedTime, 
      date, 
      aiGenerated, 
      aiReasoning,
      status,
      actions // For batch creation
    } = body

    // Handle batch creation
    if (actions && Array.isArray(actions)) {
      // Validate batch input
      if (actions.length === 0) {
        return NextResponse.json(
          { error: 'At least one action is required for batch creation' },
          { status: 400 }
        )
      }

      if (actions.length > 20) {
        return NextResponse.json(
          { error: 'Maximum 20 actions allowed per batch' },
          { status: 400 }
        )
      }

      // Validate each action
      for (const action of actions) {
        if (!action.description || action.description.length < 3) {
          return NextResponse.json(
            { error: 'Each action must have a description of at least 3 characters' },
            { status: 400 }
          )
        }
        if (!action.estimatedTime || action.estimatedTime < 1 || action.estimatedTime > 480) {
          return NextResponse.json(
            { error: 'Estimated time must be between 1 and 480 minutes' },
            { status: 400 }
          )
        }
      }

      // Create batch actions
      const actionsToCreate = actions.map(action => ({
        user_id: session.user.id,
        vision_id: action.visionId || null,
        description: action.description.trim(),
        estimated_time_minutes: action.estimatedTime,
        date: action.date || new Date().toISOString().split('T')[0],
        ai_generated: action.aiGenerated || false,
        ai_reasoning: action.aiReasoning || null,
        status: action.status || 'pending' as ActionStatus
      }))

      const createdActions = await dailyActionModel.createBatch(actionsToCreate)

      return NextResponse.json({
        success: true,
        data: createdActions,
        count: createdActions.length,
        message: `${createdActions.length} actions created successfully`
      }, { status: 201 })
    }

    // Single action creation
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Validate description
    if (description.length < 3 || description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be between 3 and 500 characters' },
        { status: 400 }
      )
    }

    // Validate estimated time
    if (!estimatedTime || estimatedTime < 1 || estimatedTime > 480) {
      return NextResponse.json(
        { error: 'Estimated time must be between 1 and 480 minutes' },
        { status: 400 }
      )
    }

    // Validate date format if provided
    const actionDate = date || new Date().toISOString().split('T')[0]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(actionDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Create single action
    const action = await dailyActionModel.create({
      user_id: session.user.id,
      vision_id: visionId || null,
      description: description.trim(),
      estimated_time_minutes: estimatedTime,
      date: actionDate,
      ai_generated: aiGenerated || false,
      ai_reasoning: aiReasoning || null,
      status: status || 'pending'
    })

    return NextResponse.json({
      success: true,
      data: action,
      message: 'Action created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create action'
      },
      { status: 500 }
    )
  }
}