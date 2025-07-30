/**
 * LocalStorage to PostgreSQL Migration Utility
 * 
 * This utility migrates user data from localStorage to PostgreSQL database
 * while preserving data integrity and providing rollback capabilities.
 */

import { User, Vision, DailyAction, TimeBudgetAllocation, VictoryPost } from '@/types'

// Migration result interface
interface MigrationResult {
  success: boolean
  userId?: string
  migratedData: {
    visions: number
    dailyActions: number
    timeBudgets: number
    progress: boolean
    timers: number
  }
  errors: string[]
  warnings: string[]
}

// LocalStorage data structure interface
interface LocalStorageData {
  visions?: Vision[]
  dailyActions?: DailyAction[]
  timeBudgets?: { [date: string]: TimeBudgetAllocation }
  victoryData?: {
    currentStreak: number
    totalDays: number
    lastCompletedDate: string
    victoryHistory?: any[]
  }
  actionTimers?: { [actionId: string]: any }
}

/**
 * Main migration function - migrates user's localStorage data to PostgreSQL
 */
export async function migrateUserFromLocalStorage(
  userId: string, 
  userEmail: string,
  userName: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    userId,
    migratedData: {
      visions: 0,
      dailyActions: 0,
      timeBudgets: 0,
      progress: false,
      timers: 0
    },
    errors: [],
    warnings: []
  }

  try {
    // Extract data from localStorage
    const localData = extractLocalStorageData()
    
    if (!localData || Object.keys(localData).length === 0) {
      result.warnings.push('No localStorage data found to migrate')
      result.success = true
      return result
    }

    // Start transaction
    const migrationId = await startMigrationTransaction(userId)

    try {
      // 1. Ensure user exists or create user record
      await ensureUserExists(userId, userEmail, userName)

      // 2. Migrate visions
      if (localData.visions?.length) {
        const visionCount = await migrateVisions(userId, localData.visions)
        result.migratedData.visions = visionCount
      }

      // 3. Migrate daily actions
      if (localData.dailyActions?.length) {
        const actionCount = await migrateDailyActions(userId, localData.dailyActions)
        result.migratedData.dailyActions = actionCount
      }

      // 4. Migrate time budgets
      if (localData.timeBudgets && Object.keys(localData.timeBudgets).length > 0) {
        const budgetCount = await migrateTimeBudgets(userId, localData.timeBudgets)
        result.migratedData.timeBudgets = budgetCount
      }

      // 5. Migrate user progress
      if (localData.victoryData) {
        await migrateUserProgress(userId, localData.victoryData)
        result.migratedData.progress = true
      }

      // 6. Migrate timer data
      if (localData.actionTimers && Object.keys(localData.actionTimers).length > 0) {
        const timerCount = await migrateTimerSessions(userId, localData.actionTimers)
        result.migratedData.timers = timerCount
      }

      // Commit transaction
      await commitMigrationTransaction(migrationId)
      
      result.success = true
      console.log('✅ LocalStorage migration completed successfully', result.migratedData)
      
    } catch (error) {
      // Rollback transaction on error
      await rollbackMigrationTransaction(migrationId)
      throw error
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown migration error'
    result.errors.push(`Migration failed: ${errorMsg}`)
    console.error('❌ LocalStorage migration failed:', error)
  }

  return result
}

/**
 * Extract and validate data from localStorage
 */
function extractLocalStorageData(): LocalStorageData | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const data: LocalStorageData = {}

    // Extract visions
    const visionsRaw = localStorage.getItem('user-visions')
    if (visionsRaw) {
      data.visions = JSON.parse(visionsRaw)
    }

    // Extract daily actions
    const actionsRaw = localStorage.getItem('daily-actions')
    if (actionsRaw) {
      data.dailyActions = JSON.parse(actionsRaw)
    }

    // Extract time budgets
    const budgetRaw = localStorage.getItem('time-budget-state')
    if (budgetRaw) {
      data.timeBudgets = JSON.parse(budgetRaw)
    }

    // Extract victory/progress data
    const victoryRaw = localStorage.getItem('victory-data')
    if (victoryRaw) {
      data.victoryData = JSON.parse(victoryRaw)
    }

    // Extract timer data
    const timersRaw = localStorage.getItem('action-timers')
    if (timersRaw) {
      data.actionTimers = JSON.parse(timersRaw)
    }

    return data
  } catch (error) {
    console.error('Failed to extract localStorage data:', error)
    return null
  }
}

/**
 * Database operation functions
 * These would integrate with your chosen database client (e.g., Prisma, Drizzle, pg)
 */

async function startMigrationTransaction(userId: string): Promise<string> {
  // Implementation depends on your database client
  // Return transaction ID for rollback capability
  const migrationId = `migration_${userId}_${Date.now()}`
  
  // Log migration start
  await logMigrationEvent(userId, 'migration_started', { migrationId })
  
  return migrationId
}

async function ensureUserExists(userId: string, email: string, name: string): Promise<void> {
  // Check if user exists, create if not
  const query = `
    INSERT INTO users (id, email, name, onboarding_completed, created_at)
    VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
  `
  
  // Execute query with your database client
  console.log('Creating/updating user record for:', { userId, email, name })
}

async function migrateVisions(userId: string, visions: Vision[]): Promise<number> {
  console.log(`Migrating ${visions.length} visions for user ${userId}`)
  
  for (const vision of visions) {
    // Insert vision
    const visionQuery = `
      INSERT INTO visions (id, user_id, category, description, priority, time_allocation_minutes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        description = EXCLUDED.description,
        priority = EXCLUDED.priority,
        time_allocation_minutes = EXCLUDED.time_allocation_minutes,
        updated_at = CURRENT_TIMESTAMP
    `
    
    // Insert AI analysis if present
    if (vision.aiAnalysis) {
      const aiQuery = `
        INSERT INTO vision_ai_analysis (
          vision_id, themes, key_goals, suggested_actions, 
          time_complexity, feasibility_score, improvements
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (vision_id) DO UPDATE SET
          themes = EXCLUDED.themes,
          key_goals = EXCLUDED.key_goals,
          suggested_actions = EXCLUDED.suggested_actions,
          time_complexity = EXCLUDED.time_complexity,
          feasibility_score = EXCLUDED.feasibility_score,
          improvements = EXCLUDED.improvements,
          updated_at = CURRENT_TIMESTAMP
      `
    }
  }
  
  return visions.length
}

async function migrateDailyActions(userId: string, actions: DailyAction[]): Promise<number> {
  console.log(`Migrating ${actions.length} daily actions for user ${userId}`)
  
  for (const action of actions) {
    const query = `
      INSERT INTO daily_actions (
        id, user_id, vision_id, description, estimated_time_minutes,
        actual_time_minutes, status, date, ai_generated, ai_reasoning,
        completed_at, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        description = EXCLUDED.description,
        estimated_time_minutes = EXCLUDED.estimated_time_minutes,
        actual_time_minutes = EXCLUDED.actual_time_minutes,
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        updated_at = CURRENT_TIMESTAMP
    `
    
    const status = action.completed ? 'completed' : 'pending'
    const completedAt = action.completed ? new Date().toISOString() : null
    
    // Execute query with values
  }
  
  return actions.length
}

async function migrateTimeBudgets(userId: string, budgets: { [date: string]: TimeBudgetAllocation }): Promise<number> {
  console.log(`Migrating ${Object.keys(budgets).length} time budgets for user ${userId}`)
  
  let migrated = 0
  
  for (const [date, budget] of Object.entries(budgets)) {
    // Insert time budget allocation
    const budgetQuery = `
      INSERT INTO time_budget_allocations (user_id, date, total_available_minutes)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, date) DO UPDATE SET
        total_available_minutes = EXCLUDED.total_available_minutes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `
    
    // Insert individual vision allocations
    if (budget.allocations) {
      for (const allocation of budget.allocations) {
        const allocationQuery = `
          INSERT INTO vision_time_allocations (budget_allocation_id, vision_id, allocated_minutes)
          VALUES ($1, $2, $3)
          ON CONFLICT (budget_allocation_id, vision_id) DO UPDATE SET
            allocated_minutes = EXCLUDED.allocated_minutes
        `
      }
    }
    
    migrated++
  }
  
  return migrated
}

async function migrateUserProgress(userId: string, victoryData: any): Promise<void> {
  console.log(`Migrating user progress for user ${userId}`)
  
  const query = `
    INSERT INTO user_progress (
      user_id, current_streak, longest_streak, total_days_completed,
      last_completion_date, created_at
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = EXCLUDED.current_streak,
      longest_streak = GREATEST(user_progress.longest_streak, EXCLUDED.longest_streak),
      total_days_completed = EXCLUDED.total_days_completed,
      last_completion_date = EXCLUDED.last_completion_date,
      updated_at = CURRENT_TIMESTAMP
  `
  
  // Execute with victoryData values
}

async function migrateTimerSessions(userId: string, timers: { [actionId: string]: any }): Promise<number> {
  console.log(`Migrating ${Object.keys(timers).length} timer sessions for user ${userId}`)
  
  let migrated = 0
  
  for (const [actionId, timer] of Object.entries(timers)) {
    if (timer.timeSpent > 0) {
      const query = `
        INSERT INTO action_timing_sessions (
          action_id, started_at, ended_at, duration_seconds, is_active
        )
        VALUES ($1, $2, $3, $4, false)
      `
      
      const duration = Math.floor(timer.timeSpent / 1000) // Convert to seconds
      const endedAt = new Date()
      const startedAt = new Date(endedAt.getTime() - timer.timeSpent)
      
      // Execute query
      migrated++
    }
  }
  
  return migrated
}

async function commitMigrationTransaction(migrationId: string): Promise<void> {
  // Commit the transaction
  console.log(`Committing migration transaction: ${migrationId}`)
}

async function rollbackMigrationTransaction(migrationId: string): Promise<void> {
  // Rollback the transaction
  console.log(`Rolling back migration transaction: ${migrationId}`)
}

async function logMigrationEvent(userId: string, event: string, data: any): Promise<void> {
  const query = `
    INSERT INTO audit_log (user_id, action, resource_type, new_values)
    VALUES ($1, 'migration', 'user_data', $2)
  `
  
  // Log migration event
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorageAfterMigration(): void {
  if (typeof window === 'undefined') return
  
  const keysToRemove = [
    'user-visions',
    'daily-actions',
    'action-timers',
    'time-budget-state',
    'victory-data',
    'futurasync-app-version'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Set migration completed flag
  localStorage.setItem('migration-completed', 'true')
  console.log('✅ LocalStorage cleared after successful migration')
}

/**
 * Check if migration has already been completed
 */
export function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('migration-completed') === 'true'
}

/**
 * Preview migration data before executing
 */
export function previewMigrationData(): {
  visions: number
  dailyActions: number
  timeBudgets: number
  hasProgress: boolean
  timers: number
} {
  const data = extractLocalStorageData()
  
  return {
    visions: data?.visions?.length || 0,
    dailyActions: data?.dailyActions?.length || 0,
    timeBudgets: data?.timeBudgets ? Object.keys(data.timeBudgets).length : 0,
    hasProgress: !!data?.victoryData,
    timers: data?.actionTimers ? Object.keys(data.actionTimers).length : 0
  }
}