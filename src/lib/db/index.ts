/**
 * Database Layer Main Export
 * 
 * Central export point for all database operations, models, and utilities.
 * This provides a clean API for the application to interact with the database.
 */

// Core database configuration and connection utilities
export { 
  getPool, 
  query, 
  transaction, 
  getClient, 
  closePool, 
  healthCheck,
  getDatabaseUrl,
  getMigrationConnection,
  getDatabaseConfig
} from './config'

// Migration utilities
export {
  migrateUserFromLocalStorage,
  clearLocalStorageAfterMigration,
  isMigrationCompleted,
  previewMigrationData
} from './migrations/localStorage-to-postgresql'

// Database models and repositories
export { userModel as UserRepository } from './models/user'
export { visionModel as VisionRepository } from './models/vision'
export { dailyActionModel as DailyActionRepository } from './models/dailyAction'
export { UserProgressRepository } from './models/progress'
export { UserSubscriptionRepository } from './models/subscription'
export { AnalyticsRepository } from './models/analytics'

// Database utilities
export * from './utils/queryBuilder'
export * from './utils/validation'
export * from './utils/audit'

// Types - export specific types to avoid conflicts
export type {
  DbUser, DbVision, DbDailyAction, DbUserProgress, DbUserSubscription,
  VisionCategory, ActionStatus, SubscriptionPlan, SubscriptionStatus,
  DatabaseHealthStatus, MigrationStatus
} from './types'

// Database initialization and setup
export { initializeDatabase, runMigrations } from './setup'