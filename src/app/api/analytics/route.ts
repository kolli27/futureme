import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dailyActionModel } from '@/lib/db/models/dailyAction'
import { visionModel } from '@/lib/db/models/vision'

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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') || 'overview'

    // Default date range (last 30 days)
    const defaultEndDate = new Date().toISOString().split('T')[0]
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const actualStartDate = startDate || defaultStartDate
    const actualEndDate = endDate || defaultEndDate

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(actualStartDate) || !/^\d{4}-\d{2}-\d{2}$/.test(actualEndDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    let analytics: any = {}

    if (type === 'overview' || type === 'actions') {
      // Get action progress stats
      const actionStats = await dailyActionModel.getProgressStats(
        session.user.id,
        actualStartDate,
        actualEndDate
      )

      // Get streak information
      const streakStats = await dailyActionModel.getActionStreak(session.user.id)

      analytics.actions = {
        ...actionStats,
        ...streakStats
      }
    }

    if (type === 'overview' || type === 'visions') {
      // Get vision statistics
      const visionStats = await visionModel.getUserVisionStats(session.user.id)
      analytics.visions = visionStats
    }

    if (type === 'overview' || type === 'time') {
      // Calculate time-based analytics
      const actions = await dailyActionModel.findByUserAndDateRange(
        session.user.id,
        actualStartDate,
        actualEndDate
      )

      const timeAnalytics = {
        totalTimeSpent: actions.reduce((sum, action) => sum + (action.actual_time_minutes || 0), 0),
        totalTimeEstimated: actions.reduce((sum, action) => sum + action.estimated_time_minutes, 0),
        averageTimePerAction: actions.length > 0 
          ? actions.reduce((sum, action) => sum + (action.actual_time_minutes || action.estimated_time_minutes), 0) / actions.length 
          : 0,
        timeAccuracy: actions.length > 0 
          ? (actions.filter(action => action.actual_time_minutes).length / actions.length) * 100
          : 0,
        mostProductiveHours: [], // Could be calculated from timing sessions
        dailyBreakdown: actions.reduce((breakdown: any, action) => {
          const date = action.date
          if (!breakdown[date]) {
            breakdown[date] = {
              date,
              actionsCount: 0,
              completedCount: 0,
              timeSpent: 0,
              timeEstimated: 0
            }
          }
          breakdown[date].actionsCount++
          if (action.status === 'completed') {
            breakdown[date].completedCount++
          }
          breakdown[date].timeSpent += action.actual_time_minutes || 0
          breakdown[date].timeEstimated += action.estimated_time_minutes
          return breakdown
        }, {})
      }

      analytics.time = timeAnalytics
    }

    if (type === 'overview' || type === 'trends') {
      // Calculate trend data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const trends = await Promise.all(
        last7Days.map(async (date) => {
          const dayActions = await dailyActionModel.findByUserAndDate(session.user.id, date)
          return {
            date,
            total: dayActions.length,
            completed: dayActions.filter(a => a.status === 'completed').length,
            completionRate: dayActions.length > 0 
              ? (dayActions.filter(a => a.status === 'completed').length / dayActions.length) * 100 
              : 0
          }
        })
      )

      analytics.trends = {
        last7Days: trends,
        weeklyAverage: trends.reduce((sum, day) => sum + day.completionRate, 0) / 7
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      dateRange: {
        startDate: actualStartDate,
        endDate: actualEndDate
      },
      type
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve analytics'
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

    // Parse request body for event tracking
    const body = await request.json()
    const { event, properties } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would store analytics events
    // For now, we'll just log them
    console.log('Analytics Event:', {
      userId: session.user.id,
      event,
      properties: properties || {},
      timestamp: new Date().toISOString()
    })

    // TODO: Store in analytics_events table when implemented
    
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })

  } catch (error) {
    console.error('Track Analytics Event Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to track event'
      },
      { status: 500 }
    )
  }
}