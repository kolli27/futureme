/**
 * User Data Export API Endpoint (GDPR Compliance)
 * 
 * Provides comprehensive data export functionality for GDPR compliance.
 * Generates secure download links for user data exports.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, transaction } from '@/lib/db/config'
import { PoolClient } from 'pg'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requestedUserId = params.id
    const currentUserId = session.user.id

    // Users can only export their own data
    if (requestedUserId !== currentUserId) {
      return NextResponse.json(
        { error: 'Forbidden: Can only export your own data' },
        { status: 403 }
      )
    }

    // Check for existing pending export requests
    const existingRequests = await query(
      `SELECT id, status, requested_at FROM data_export_requests 
       WHERE user_id = $1 AND status IN ('pending', 'processing') 
       ORDER BY requested_at DESC LIMIT 1`,
      [requestedUserId]
    )

    if (existingRequests.length > 0) {
      const existingRequest = existingRequests[0]
      return NextResponse.json({
        message: 'Export request already in progress',
        request_id: existingRequest.id,
        status: existingRequest.status,
        requested_at: existingRequest.requested_at
      }, { status: 409 })
    }

    // Create new export request
    const exportRequest = await query(
      `INSERT INTO data_export_requests (user_id, status)
       VALUES ($1, 'pending')
       RETURNING id, requested_at`,
      [requestedUserId]
    )

    const requestId = exportRequest[0].id

    // Generate the export data immediately (for demo - in production, this would be async)
    const exportData = await generateUserExportData(requestedUserId)
    
    // In a real production system, you would:
    // 1. Queue this as a background job
    // 2. Upload the export to S3 or similar
    // 3. Send email notification when ready
    // 4. Set expiration time for download link

    // For this demo, we'll simulate the process
    const exportUrl = await createExportDownload(requestId, exportData)

    // Update request as completed
    await query(
      `UPDATE data_export_requests 
       SET status = 'completed', export_url = $1, completed_at = CURRENT_TIMESTAMP,
           expires_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
       WHERE id = $2`,
      [exportUrl, requestId]
    )

    // Log the export request
    await query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, new_values, ip_address)
       VALUES ($1, 'export_data', 'user', $2, $3, $4)`,
      [
        currentUserId,
        requestedUserId,
        JSON.stringify({ request_id: requestId, export_size: JSON.stringify(exportData).length }),
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Data export completed',
      request_id: requestId,
      download_url: exportUrl,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      data_summary: {
        total_records: getTotalRecordCount(exportData),
        categories: Object.keys(exportData).filter(key => key !== 'metadata')
      }
    })

  } catch (error) {
    console.error('Data export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during data export' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requestedUserId = params.id
    const currentUserId = session.user.id

    // Users can only check their own export status
    if (requestedUserId !== currentUserId) {
      return NextResponse.json(
        { error: 'Forbidden: Can only check your own export status' },
        { status: 403 }
      )
    }

    // Get export request history
    const exportRequests = await query(
      `SELECT id, status, requested_at, completed_at, expires_at, export_url
       FROM data_export_requests 
       WHERE user_id = $1 
       ORDER BY requested_at DESC 
       LIMIT 10`,
      [requestedUserId]
    )

    return NextResponse.json({
      export_requests: exportRequests,
      can_request_new: !exportRequests.some(r => ['pending', 'processing'].includes(r.status))
    })

  } catch (error) {
    console.error('Export status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate comprehensive export data for a user
 */
async function generateUserExportData(userId: string): Promise<any> {
  return transaction(async (client: PoolClient) => {
    const exportData: any = {
      metadata: {
        user_id: userId,
        export_date: new Date().toISOString(),
        format_version: '1.0.0',
        generated_by: 'FutureSync Export System'
      }
    }

    // User profile data
    const userData = await client.query(
      `SELECT id, email, name, display_name, avatar_url, timezone, locale,
              onboarding_completed, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    )
    exportData.profile = userData.rows[0]

    // User progress
    const progressData = await client.query(
      `SELECT current_streak, longest_streak, total_days_completed,
              total_actions_completed, total_time_invested_minutes,
              last_completion_date, created_at, updated_at
       FROM user_progress WHERE user_id = $1`,
      [userId]
    )
    exportData.progress = progressData.rows[0]

    // Visions
    const visionsData = await client.query(
      `SELECT v.*, va.themes, va.key_goals, va.suggested_actions, 
              va.time_complexity, va.feasibility_score, va.improvements
       FROM visions v
       LEFT JOIN vision_ai_analysis va ON v.id = va.vision_id
       WHERE v.user_id = $1
       ORDER BY v.created_at`,
      [userId]
    )
    exportData.visions = visionsData.rows

    // Daily actions
    const actionsData = await client.query(
      `SELECT da.*, v.category as vision_category, v.description as vision_description
       FROM daily_actions da
       LEFT JOIN visions v ON da.vision_id = v.id
       WHERE da.user_id = $1
       ORDER BY da.date DESC, da.created_at`,
      [userId]
    )
    exportData.daily_actions = actionsData.rows

    // Time tracking sessions
    const timingData = await client.query(
      `SELECT ats.*, da.description as action_description, da.date as action_date
       FROM action_timing_sessions ats
       LEFT JOIN daily_actions da ON ats.action_id = da.id
       WHERE da.user_id = $1
       ORDER BY ats.started_at DESC`,
      [userId]
    )
    exportData.time_tracking = timingData.rows

    // Time budget allocations
    const budgetData = await client.query(
      `SELECT tba.*, vta.vision_id, vta.allocated_minutes, v.category, v.description
       FROM time_budget_allocations tba
       LEFT JOIN vision_time_allocations vta ON tba.id = vta.budget_allocation_id
       LEFT JOIN visions v ON vta.vision_id = v.id
       WHERE tba.user_id = $1
       ORDER BY tba.date DESC`,
      [userId]
    )
    exportData.time_budgets = budgetData.rows

    // Victory posts
    const victoryData = await client.query(
      `SELECT id, content, day_number, goal_description, is_public,
              likes_count, comments_count, created_at
       FROM victory_posts WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
    exportData.victory_posts = victoryData.rows

    // Achievements
    const achievementsData = await client.query(
      `SELECT ua.unlocked_at, a.key, a.title, a.description, a.icon
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    )
    exportData.achievements = achievementsData.rows

    // Notification preferences
    const notificationPrefs = await client.query(
      `SELECT daily_reminders, achievement_notifications, streak_milestones,
              team_updates, email_notifications, push_notifications,
              notification_time, timezone
       FROM user_notification_preferences WHERE user_id = $1`,
      [userId]
    )
    exportData.notification_preferences = notificationPrefs.rows[0]

    // Subscription data
    const subscriptionData = await client.query(
      `SELECT plan, status, current_period_start, current_period_end,
              cancel_at_period_end, trial_ends_at, created_at
       FROM user_subscriptions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )
    exportData.subscription = subscriptionData.rows[0]

    return exportData
  })
}

/**
 * Create a download link for export data
 * In production, this would upload to S3 and return a signed URL
 */
async function createExportDownload(requestId: string, exportData: any): Promise<string> {
  // In a real implementation, you would:
  // 1. Upload the JSON to S3 or similar storage
  // 2. Generate a signed URL with expiration
  // 3. Return the signed URL
  
  // For this demo, we'll create a simple data URL
  const jsonData = JSON.stringify(exportData, null, 2)
  const base64Data = Buffer.from(jsonData).toString('base64')
  
  // In production, replace this with actual file storage URL
  return `data:application/json;base64,${base64Data}`
}

/**
 * Count total records in export data
 */
function getTotalRecordCount(exportData: any): number {
  let count = 0
  
  Object.entries(exportData).forEach(([key, value]) => {
    if (key !== 'metadata' && Array.isArray(value)) {
      count += value.length
    } else if (key !== 'metadata' && value && typeof value === 'object') {
      count += 1
    }
  })
  
  return count
}