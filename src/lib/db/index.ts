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
export * from './models/user'
export * from './models/vision'
export * from './models/dailyAction'
export * from './models/progress'
export * from './models/subscription'
export * from './models/analytics'

// Database utilities
export * from './utils/queryBuilder'
export * from './utils/validation'
export * from './utils/audit'

// Types
export * from './types'

// Database initialization and setup
export { initializeDatabase, runMigrations } from './setup'