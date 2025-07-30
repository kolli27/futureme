import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dailyActionModel } from '@/lib/db/models/dailyAction'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { action } = body // 'start' or 'stop'

    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "stop"' },
        { status: 400 }
      )
    }

    let result
    if (action === 'start') {
      result = await dailyActionModel.startTimer(params.id, session.user.id)
      if (!result) {
        return NextResponse.json(
          { error: 'Action not found or timer could not be started' },
          { status: 404 }
        )
      }
    } else {
      result = await dailyActionModel.stopTimer(params.id, session.user.id)
      if (!result) {
        return NextResponse.json(
          { error: 'Action not found or no active timer to stop' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Timer ${action}ed successfully`
    })

  } catch (error) {
    console.error('Timer Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage timer'
      },
      { status: 500 }
    )
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

    // Get active timer for the action
    const timer = await dailyActionModel.getActiveTimer(params.id, session.user.id)

    return NextResponse.json({
      success: true,
      data: timer,
      hasActiveTimer: !!timer
    })

  } catch (error) {
    console.error('Get Timer API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get timer status'
      },
      { status: 500 }
    )
  }
}