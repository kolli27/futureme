/**
 * Daily Action Database Model
 * 
 * Handles all daily action-related database operations including CRUD,
 * time tracking, and progress management.
 */

import { PoolClient } from 'pg'
import { query, transaction } from '../config'
import { 
  DbDailyAction, 
  DbActionTimingSession,
  ActionStatus
} from '../types'

interface CreateDailyActionInput {
  user_id: string
  vision_id?: string
  description: string
  estimated_time_minutes: number
  date: string // YYYY-MM-DD format
  ai_generated?: boolean
  ai_reasoning?: string
  status?: ActionStatus
}

interface UpdateDailyActionInput {
  description?: string
  estimated_time_minutes?: number
  actual_time_minutes?: number
  status?: ActionStatus
  completed_at?: Date
}

interface ActionProgress {
  totalActions: number
  completedActions: number
  pendingActions: number
  totalTimeSpent: number
  completionRate: number
  averageTimePerAction: number
}

class DailyActionModel {
  /**
   * Find action by ID
   */
  async findById(id: string): Promise<DbDailyAction | null> {
    const result = await query<DbDailyAction>(
      'SELECT * FROM daily_actions WHERE id = $1',
      [id]
    )
    return result[0] || null
  }

  /**
   * Find action by ID with user validation
   */
  async findByIdForUser(id: string, userId: string): Promise<DbDailyAction | null> {
    const result = await query<DbDailyAction>(
      'SELECT * FROM daily_actions WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return result[0] || null
  }

  /**
   * Find all actions for a user on a specific date
   */
  async findByUserAndDate(userId: string, date: string): Promise<DbDailyAction[]> {
    return await query<DbDailyAction>(
      'SELECT * FROM daily_actions WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC',
      [userId, date]
    )
  }

  /**
   * Find actions for a user within a date range
   */
  async findByUserAndDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DbDailyAction[]> {
    return await query<DbDailyAction>(
      `SELECT * FROM daily_actions 
       WHERE user_id = $1 AND date >= $2 AND date <= $3 
       ORDER BY date DESC, created_at ASC`,
      [userId, startDate, endDate]
    )
  }

  /**
   * Find actions by vision ID
   */
  async findByVision(visionId: string, userId: string): Promise<DbDailyAction[]> {
    return await query<DbDailyAction>(
      `SELECT * FROM daily_actions 
       WHERE vision_id = $1 AND user_id = $2 
       ORDER BY date DESC, created_at ASC`,
      [visionId, userId]
    )
  }

  /**
   * Find actions with timing sessions
   */
  async findWithTimingSessions(
    userId: string, 
    date: string
  ): Promise<Array<DbDailyAction & { timingSessions: DbActionTimingSession[] }>> {
    const result = await query<any>(
      `SELECT 
        a.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'action_id', t.action_id,
              'started_at', t.started_at,
              'ended_at', t.ended_at,
              'duration_seconds', t.duration_seconds,
              'is_active', t.is_active,
              'created_at', t.created_at
            ) ORDER BY t.created_at
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'::json
        ) as timing_sessions
       FROM daily_actions a
       LEFT JOIN action_timing_sessions t ON a.id = t.action_id
       WHERE a.user_id = $1 AND a.date = $2
       GROUP BY a.id
       ORDER BY a.created_at ASC`,
      [userId, date]
    )

    return result.map(row => ({
      id: row.id,
      user_id: row.user_id,
      vision_id: row.vision_id,
      description: row.description,
      estimated_time_minutes: row.estimated_time_minutes,
      actual_time_minutes: row.actual_time_minutes,
      status: row.status,
      date: row.date,
      ai_generated: row.ai_generated,
      ai_reasoning: row.ai_reasoning,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      timingSessions: row.timing_sessions || []
    }))
  }

  /**
   * Create a new daily action
   */
  async create(input: CreateDailyActionInput): Promise<DbDailyAction> {
    const result = await query<DbDailyAction>(
      `INSERT INTO daily_actions (
        user_id, vision_id, description, estimated_time_minutes, 
        date, ai_generated, ai_reasoning, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        input.user_id,
        input.vision_id || null,
        input.description,
        input.estimated_time_minutes,
        input.date,
        input.ai_generated || false,
        input.ai_reasoning || null,
        input.status || 'pending'
      ]
    )

    return result[0]
  }

  /**
   * Create multiple daily actions in batch
   */
  async createBatch(inputs: CreateDailyActionInput[]): Promise<DbDailyAction[]> {
    return transaction(async (client: PoolClient) => {
      const results: DbDailyAction[] = []
      
      for (const input of inputs) {
        const result = await client.query<DbDailyAction>(
          `INSERT INTO daily_actions (
            user_id, vision_id, description, estimated_time_minutes, 
            date, ai_generated, ai_reasoning, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            input.user_id,
            input.vision_id || null,
            input.description,
            input.estimated_time_minutes,
            input.date,
            input.ai_generated || false,
            input.ai_reasoning || null,
            input.status || 'pending'
          ]
        )
        results.push(result.rows[0])
      }
      
      return results
    })
  }

  /**
   * Update daily action
   */
  async update(
    id: string, 
    userId: string, 
    input: UpdateDailyActionInput
  ): Promise<DbDailyAction | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 0

    // Build dynamic update query
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${++paramCount}`)
        params.push(value)
      }
    })

    if (updateFields.length === 0) {
      return this.findByIdForUser(id, userId)
    }

    params.push(id, userId)
    const result = await query<DbDailyAction>(
      `UPDATE daily_actions 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${++paramCount} AND user_id = $${++paramCount}
       RETURNING *`,
      params
    )

    return result[0] || null
  }

  /**
   * Complete action
   */
  async complete(
    id: string, 
    userId: string, 
    actualTimeMinutes?: number
  ): Promise<DbDailyAction | null> {
    const updateData: UpdateDailyActionInput = {
      status: 'completed',
      completed_at: new Date()
    }

    if (actualTimeMinutes !== undefined) {
      updateData.actual_time_minutes = actualTimeMinutes
    }

    return this.update(id, userId, updateData)
  }

  /**
   * Skip action
   */
  async skip(id: string, userId: string): Promise<DbDailyAction | null> {
    return this.update(id, userId, { status: 'skipped' })
  }

  /**
   * Start timing session for an action
   */
  async startTimer(actionId: string, userId: string): Promise<DbActionTimingSession | null> {
    // First validate the action belongs to the user
    const action = await this.findByIdForUser(actionId, userId)
    if (!action) return null

    // End any active timer sessions for this action
    await query(
      `UPDATE action_timing_sessions 
       SET ended_at = CURRENT_TIMESTAMP, 
           duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::integer,
           is_active = false
       WHERE action_id = $1 AND is_active = true`,
      [actionId]
    )

    // Create new timing session
    const result = await query<DbActionTimingSession>(
      `INSERT INTO action_timing_sessions (action_id, started_at, is_active)
       VALUES ($1, CURRENT_TIMESTAMP, true)
       RETURNING *`,
      [actionId]
    )

    // Update action status to in_progress
    await this.update(actionId, userId, { status: 'in_progress' })

    return result[0]
  }

  /**
   * Stop timing session for an action
   */
  async stopTimer(actionId: string, userId: string): Promise<DbActionTimingSession | null> {
    // First validate the action belongs to the user
    const action = await this.findByIdForUser(actionId, userId)
    if (!action) return null

    const result = await query<DbActionTimingSession>(
      `UPDATE action_timing_sessions 
       SET ended_at = CURRENT_TIMESTAMP, 
           duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::integer,
           is_active = false
       WHERE action_id = $1 AND is_active = true
       RETURNING *`,
      [actionId]
    )

    return result[0] || null
  }

  /**
   * Get active timing session for an action
   */
  async getActiveTimer(actionId: string, userId: string): Promise<DbActionTimingSession | null> {
    // First validate the action belongs to the user
    const action = await this.findByIdForUser(actionId, userId)
    if (!action) return null

    const result = await query<DbActionTimingSession>(
      'SELECT * FROM action_timing_sessions WHERE action_id = $1 AND is_active = true',
      [actionId]
    )

    return result[0] || null
  }

  /**
   * Delete daily action
   */
  async delete(id: string, userId: string): Promise<boolean> {
    return transaction(async (client: PoolClient) => {
      // Delete timing sessions first
      await client.query('DELETE FROM action_timing_sessions WHERE action_id = $1', [id])
      
      // Delete the action
      const result = await client.query(
        'DELETE FROM daily_actions WHERE id = $1 AND user_id = $2',
        [id, userId]
      )
      
      return result.rowCount > 0
    })
  }

  /**
   * Get user's action progress for a date range
   */
  async getProgressStats(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<ActionProgress> {
    const result = await query<any>(
      `SELECT 
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_actions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_actions,
        COALESCE(SUM(actual_time_minutes), 0) as total_time_spent,
        COALESCE(AVG(actual_time_minutes), 0) as average_time_per_action
       FROM daily_actions 
       WHERE user_id = $1 AND date >= $2 AND date <= $3`,
      [userId, startDate, endDate]
    )

    const row = result[0]
    const totalActions = parseInt(row.total_actions)
    const completedActions = parseInt(row.completed_actions)
    const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

    return {
      totalActions,
      completedActions,
      pendingActions: parseInt(row.pending_actions),
      totalTimeSpent: parseInt(row.total_time_spent),
      completionRate,
      averageTimePerAction: parseFloat(row.average_time_per_action)
    }
  }

  /**
   * Get user's daily action streak
   */
  async getActionStreak(userId: string): Promise<{
    currentStreak: number
    longestStreak: number
    lastCompletionDate: string | null
  }> {
    const result = await query<any>(
      `WITH daily_completions AS (
        SELECT date, 
               COUNT(*) FILTER (WHERE status = 'completed') > 0 as has_completions
        FROM daily_actions 
        WHERE user_id = $1 
        GROUP BY date
        ORDER BY date DESC
      ),
      streak_calculation AS (
        SELECT date,
               has_completions,
               ROW_NUMBER() OVER (ORDER BY date DESC) -
               ROW_NUMBER() OVER (PARTITION BY has_completions ORDER BY date DESC) as streak_group
        FROM daily_completions
      )
      SELECT 
        MAX(CASE WHEN has_completions THEN streak_length ELSE 0 END) as current_streak,
        (SELECT MAX(completion_streak) FROM (
          SELECT COUNT(*) as completion_streak
          FROM streak_calculation 
          WHERE has_completions = true
          GROUP BY streak_group
        ) subq) as longest_streak,
        (SELECT MAX(date) FROM daily_actions WHERE user_id = $1 AND status = 'completed') as last_completion_date
      FROM (
        SELECT COUNT(*) as streak_length
        FROM streak_calculation 
        WHERE has_completions = true AND streak_group = 0
      ) current`,
      [userId]
    )

    const row = result[0]
    return {
      currentStreak: parseInt(row.current_streak) || 0,
      longestStreak: parseInt(row.longest_streak) || 0,
      lastCompletionDate: row.last_completion_date
    }
  }

  /**
   * Clear all actions for a user on a specific date
   */
  async clearByDate(userId: string, date: string): Promise<number> {
    return transaction(async (client: PoolClient) => {
      // Get action IDs first
      const actions = await client.query(
        'SELECT id FROM daily_actions WHERE user_id = $1 AND date = $2',
        [userId, date]
      )
      
      const actionIds = actions.rows.map(row => row.id)
      
      if (actionIds.length === 0) return 0
      
      // Delete timing sessions
      await client.query(
        'DELETE FROM action_timing_sessions WHERE action_id = ANY($1)',
        [actionIds]
      )
      
      // Delete actions
      const result = await client.query(
        'DELETE FROM daily_actions WHERE user_id = $1 AND date = $2',
        [userId, date]
      )
      
      return result.rowCount
    })
  }
}

// Export singleton instance
export const dailyActionModel = new DailyActionModel()
export default dailyActionModel

// Export types
export type { 
  CreateDailyActionInput, 
  UpdateDailyActionInput, 
  ActionProgress 
}