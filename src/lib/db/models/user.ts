/**
 * User Database Model
 * 
 * Handles all user-related database operations including CRUD,
 * authentication, and user management features.
 */

import { PoolClient } from 'pg'
import { query, transaction } from '../config'
import { 
  DbUser, 
  DbUserProgress, 
  DbUserSubscription,
  CreateUserInput, 
  UpdateUserInput, 
  UserRepository,
  FilterParams,
  PaginationParams,
  SortParams
} from '../types'

class UserModel implements UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<DbUser | null> {
    const result = await query<DbUser>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )
    return result[0] || null
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<DbUser | null> {
    const result = await query<DbUser>(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    )
    return result[0] || null
  }

  /**
   * Find multiple users with filters
   */
  async findMany(
    filters?: FilterParams, 
    pagination?: PaginationParams, 
    sort?: SortParams
  ): Promise<DbUser[]> {
    let sql = 'SELECT * FROM users WHERE deleted_at IS NULL'
    const params: any[] = []
    let paramCount = 0

    // Apply filters
    if (filters) {
      if (filters.role) {
        sql += ` AND role = $${++paramCount}`
        params.push(filters.role)
      }
      if (filters.is_active !== undefined) {
        sql += ` AND is_active = $${++paramCount}`
        params.push(filters.is_active)
      }
      if (filters.onboarding_completed !== undefined) {
        sql += ` AND onboarding_completed = $${++paramCount}`
        params.push(filters.onboarding_completed)
      }
      if (filters.search) {
        sql += ` AND (name ILIKE $${++paramCount} OR email ILIKE $${++paramCount})`
        params.push(`%${filters.search}%`, `%${filters.search}%`)
        paramCount++ // Account for the second parameter
      }
    }

    // Apply sorting
    if (sort) {
      sql += ` ORDER BY ${sort.column} ${sort.direction}`
    } else {
      sql += ' ORDER BY created_at DESC'
    }

    // Apply pagination
    if (pagination) {
      sql += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`
      params.push(pagination.limit, pagination.offset)
    }

    return await query<DbUser>(sql, params)
  }

  /**
   * Find active users
   */
  async findActiveUsers(pagination?: PaginationParams): Promise<DbUser[]> {
    return this.findMany({ is_active: true }, pagination)
  }

  /**
   * Create a new user
   */
  async create(input: CreateUserInput): Promise<DbUser> {
    const result = await query<DbUser>(
      `INSERT INTO users (
        email, email_verified_at, password_hash, name, display_name, 
        avatar_url, timezone, locale, role, is_active, onboarding_completed, trial_ends_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        input.email,
        input.email_verified_at || null,
        input.password_hash || null,
        input.name,
        input.display_name || null,
        input.avatar_url || null,
        input.timezone || 'UTC',
        input.locale || 'en-US',
        input.role || 'user',
        input.is_active !== undefined ? input.is_active : true,
        input.onboarding_completed || false,
        input.trial_ends_at || null
      ]
    )

    const user = result[0]

    // Create default user progress record
    await this.createUserProgress(user.id)

    // Create default notification preferences
    await this.createNotificationPreferences(user.id)

    return user
  }

  /**
   * Update user
   */
  async update(id: string, input: UpdateUserInput): Promise<DbUser | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 0

    // Build dynamic update query
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        updateFields.push(`${key} = $${++paramCount}`)
        params.push(value)
      }
    })

    if (updateFields.length === 0) {
      return this.findById(id)
    }

    params.push(id)
    const result = await query<DbUser>(
      `UPDATE users 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${++paramCount} AND deleted_at IS NULL
       RETURNING *`,
      params
    )

    return result[0] || null
  }

  /**
   * Soft delete user (GDPR compliant)
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP, 
           email = 'deleted_' || id || '@deleted.local',
           is_active = false
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    return result.length > 0
  }

  /**
   * Hard delete user (permanent - use with caution)
   */
  async delete(id: string): Promise<boolean> {
    return transaction(async (client: PoolClient) => {
      // Delete in order of dependencies
      await client.query('DELETE FROM user_achievements WHERE user_id = $1', [id])
      await client.query('DELETE FROM user_notifications WHERE user_id = $1', [id])
      await client.query('DELETE FROM user_notification_preferences WHERE user_id = $1', [id])
      await client.query('DELETE FROM victory_post_interactions WHERE user_id = $1', [id])
      await client.query('DELETE FROM victory_posts WHERE user_id = $1', [id])
      await client.query('DELETE FROM user_progress WHERE user_id = $1', [id])
      await client.query('DELETE FROM vision_time_allocations WHERE vision_id IN (SELECT id FROM visions WHERE user_id = $1)', [id])
      await client.query('DELETE FROM time_budget_allocations WHERE user_id = $1', [id])
      await client.query('DELETE FROM action_timing_sessions WHERE action_id IN (SELECT id FROM daily_actions WHERE user_id = $1)', [id])
      await client.query('DELETE FROM daily_actions WHERE user_id = $1', [id])
      await client.query('DELETE FROM vision_ai_analysis WHERE vision_id IN (SELECT id FROM visions WHERE user_id = $1)', [id])
      await client.query('DELETE FROM visions WHERE user_id = $1', [id])
      await client.query('DELETE FROM user_subscriptions WHERE user_id = $1', [id])
      await client.query('DELETE FROM organization_members WHERE user_id = $1', [id])
      await client.query('DELETE FROM user_oauth_providers WHERE user_id = $1', [id])
      
      const result = await client.query('DELETE FROM users WHERE id = $1', [id])
      return (result.rowCount || 0) > 0
    })
  }

  /**
   * Count users with filters
   */
  async count(filters?: FilterParams): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'
    const params: any[] = []
    let paramCount = 0

    if (filters) {
      if (filters.role) {
        sql += ` AND role = $${++paramCount}`
        params.push(filters.role)
      }
      if (filters.is_active !== undefined) {
        sql += ` AND is_active = $${++paramCount}`
        params.push(filters.is_active)
      }
    }

    const result = await query<{ count: string }>(sql, params)
    return parseInt(result[0].count)
  }

  /**
   * Find user with progress and subscription data
   */
  async findWithProgressAndSubscription(id: string): Promise<{
    user: DbUser
    progress: DbUserProgress | null
    subscription: DbUserSubscription | null
  } | null> {
    const result = await query<any>(
      `SELECT 
        u.*,
        p.current_streak, p.longest_streak, p.total_days_completed, 
        p.total_actions_completed, p.total_time_invested_minutes,
        p.last_completion_date, p.streak_updated_at as progress_updated_at,
        s.plan, s.status as subscription_status, s.current_period_end,
        s.cancel_at_period_end, s.trial_ends_at as subscription_trial_ends
       FROM users u
       LEFT JOIN user_progress p ON u.id = p.user_id
       LEFT JOIN user_subscriptions s ON u.id = s.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id]
    )

    if (!result[0]) return null

    const row = result[0]
    return {
      user: {
        id: row.id,
        email: row.email,
        email_verified_at: row.email_verified_at,
        password_hash: row.password_hash,
        name: row.name,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        timezone: row.timezone,
        locale: row.locale,
        role: row.role,
        is_active: row.is_active,
        last_login: row.last_login,
        onboarding_completed: row.onboarding_completed,
        trial_ends_at: row.trial_ends_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at
      },
      progress: row.current_streak !== null ? {
        id: row.progress_id,
        user_id: row.id,
        current_streak: row.current_streak,
        longest_streak: row.longest_streak,
        total_days_completed: row.total_days_completed,
        total_actions_completed: row.total_actions_completed,
        total_time_invested_minutes: row.total_time_invested_minutes,
        last_completion_date: row.last_completion_date,
        streak_updated_at: row.progress_updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      } : null,
      subscription: row.plan ? {
        id: row.subscription_id,
        user_id: row.id,
        organization_id: undefined,
        plan: row.plan,
        status: row.subscription_status,
        stripe_subscription_id: undefined,
        stripe_customer_id: undefined,
        current_period_start: undefined,
        current_period_end: row.current_period_end,
        cancel_at_period_end: row.cancel_at_period_end,
        canceled_at: undefined,
        trial_ends_at: row.subscription_trial_ends,
        created_at: row.created_at,
        updated_at: row.updated_at
      } : null
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    )
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(id: string): Promise<DbUser | null> {
    return this.update(id, { onboarding_completed: true })
  }

  /**
   * Private helper methods
   */
  private async createUserProgress(userId: string): Promise<void> {
    await query(
      `INSERT INTO user_progress (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    )
  }

  private async createNotificationPreferences(userId: string): Promise<void> {
    await query(
      `INSERT INTO user_notification_preferences (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    )
  }
}

// Export singleton instance
export const userModel = new UserModel()
export default userModel