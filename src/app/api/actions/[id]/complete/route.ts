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
    const { actualTimeMinutes } = body

    // Validate actual time if provided
    if (actualTimeMinutes !== undefined && (actualTimeMinutes < 0 || actualTimeMinutes > 960)) {
      return NextResponse.json(
        { error: 'Actual time must be between 0 and 960 minutes' },
        { status: 400 }
      )
    }

    // Complete the action
    const action = await dailyActionModel.complete(
      params.id, 
      session.user.id, 
      actualTimeMinutes
    )

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: action,
      message: 'Action completed successfully'
    })

  } catch (error) {
    console.error('Complete Action API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to complete action'
      },
      { status: 500 }
    )
  }
}