/**
 * Database Setup and Initialization
 * 
 * Handles database initialization, migrations, and setup tasks
 * for both development and production environments.
 */

import fs from 'fs/promises'
import path from 'path'
import { getMigrationConnection, query } from './config'
import { Client } from 'pg'

interface MigrationFile {
  version: string
  filename: string
  path: string
}

interface MigrationResult {
  version: string
  success: boolean
  error?: string
  executionTime: number
}

/**
 * Initialize the database with schema and seed data
 */
export async function initializeDatabase(): Promise<{
  success: boolean
  migrations: MigrationResult[]
  errors: string[]
}> {
  console.log('🚀 Initializing FutureSync database...')
  
  const result = {
    success: false,
    migrations: [] as MigrationResult[],
    errors: [] as string[]
  }

  try {
    // Run all pending migrations
    const migrationResults = await runMigrations()
    result.migrations = migrationResults.results
    
    if (migrationResults.success) {
      // Insert default achievements
      await insertDefaultAchievements()
      
      // Insert default system data
      await insertSystemDefaults()
      
      result.success = true
      console.log('✅ Database initialization completed successfully')
    } else {
      result.errors = migrationResults.errors
      console.error('❌ Database initialization failed during migrations')
    }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Database initialization failed: ${errorMsg}`)
    console.error('❌ Database initialization failed:', error)
  }

  return result
}

/**
 * Run all pending database migrations
 */
export async function runMigrations(): Promise<{
  success: boolean
  results: MigrationResult[]
  errors: string[]
}> {
  console.log('🔄 Running database migrations...')
  
  const result = {
    success: false,
    results: [] as MigrationResult[],
    errors: [] as string[]
  }

  let client: Client | null = null

  try {
    client = await getMigrationConnection()
    
    // Ensure schema_migrations table exists
    await ensureMigrationsTable(client)
    
    // Get all migration files
    const migrationFiles = await getMigrationFiles()
    
    // Get applied migrations from database
    const appliedMigrations = await getAppliedMigrations(client)
    
    // Filter pending migrations
    const pendingMigrations = migrationFiles.filter(
      migration => !appliedMigrations.includes(migration.version)
    )
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found')
      result.success = true
      return result
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations`)
    
    // Run each pending migration
    for (const migration of pendingMigrations) {
      const migrationResult = await runSingleMigration(client, migration)
      result.results.push(migrationResult)
      
      if (!migrationResult.success) {
        result.errors.push(`Migration ${migration.version} failed: ${migrationResult.error}`)
        console.error(`❌ Migration ${migration.version} failed:`, migrationResult.error)
        break
      }
      
      console.log(`✅ Migration ${migration.version} completed in ${migrationResult.executionTime}ms`)
    }
    
    // Check if all migrations succeeded
    result.success = result.results.every(r => r.success)
    
    if (result.success) {
      console.log(`✅ All ${result.results.length} migrations completed successfully`)
    }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown migration error'
    result.errors.push(`Migration system error: ${errorMsg}`)
    console.error('❌ Migration system error:', error)
  } finally {
    if (client) {
      await client.end()
    }
  }

  return result
}

/**
 * Get all migration files from the migrations directory
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  const migrationsDir = path.join(__dirname, 'migrations')
  
  try {
    const files = await fs.readdir(migrationsDir)
    const migrationFiles: MigrationFile[] = []
    
    for (const filename of files) {
      if (filename.endsWith('.sql')) {
        const version = filename.replace('.sql', '')
        migrationFiles.push({
          version,
          filename,
          path: path.join(migrationsDir, filename)
        })
      }
    }
    
    // Sort by version
    migrationFiles.sort((a, b) => a.version.localeCompare(b.version))
    
    return migrationFiles
  } catch (error) {
    console.error('Failed to read migrations directory:', error)
    return []
  }
}

/**
 * Get list of applied migrations from database
 */
async function getAppliedMigrations(client: Client): Promise<string[]> {
  try {
    const result = await client.query('SELECT version FROM schema_migrations ORDER BY version')
    return result.rows.map(row => row.version)
  } catch (error) {
    console.error('Failed to get applied migrations:', error)
    return []
  }
}

/**
 * Ensure schema_migrations table exists
 */
async function ensureMigrationsTable(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(50) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

/**
 * Run a single migration file
 */
async function runSingleMigration(client: Client, migration: MigrationFile): Promise<MigrationResult> {
  const startTime = Date.now()
  
  try {
    // Read migration file
    const sql = await fs.readFile(migration.path, 'utf8')
    
    // Execute migration in a transaction
    await client.query('BEGIN')
    
    try {
      // Execute the migration SQL
      await client.query(sql)
      
      // Record the migration as applied
      await client.query(
        'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING',
        [migration.version]
      )
      
      await client.query('COMMIT')
      
      return {
        version: migration.version,
        success: true,
        executionTime: Date.now() - startTime
      }
      
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    return {
      version: migration.version,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime
    }
  }
}

/**
 * Insert default achievements into the database
 */
async function insertDefaultAchievements(): Promise<void> {
  console.log('📦 Inserting default achievements...')
  
  const achievements = [
    {
      key: 'first_day',
      title: 'First Steps',
      description: 'Complete your first day of actions',
      icon: '🎯',
      background_color: '#10B981',
      criteria: { days_completed: 1 }
    },
    {
      key: 'week_warrior',
      title: 'Week Warrior',
      description: 'Complete 7 consecutive days',
      icon: '🔥',
      background_color: '#F59E0B',
      criteria: { streak: 7 }
    },
    {
      key: 'month_master',
      title: 'Month Master',
      description: 'Complete 30 consecutive days',
      icon: '👑',
      background_color: '#8B5CF6',
      criteria: { streak: 30 }
    },
    {
      key: 'century_club',
      title: 'Century Club',
      description: 'Complete 100 total days',
      icon: '💯',
      background_color: '#EF4444',
      criteria: { total_days: 100 }
    },
    {
      key: 'vision_creator',
      title: 'Vision Creator',
      description: 'Create your first vision',
      icon: '🎨',
      background_color: '#06B6D4',
      criteria: { visions_created: 1 }
    },
    {
      key: 'action_hero',
      title: 'Action Hero',
      description: 'Complete 100 total actions',
      icon: '⚡',
      background_color: '#84CC16',
      criteria: { actions_completed: 100 }
    },
    {
      key: 'time_investor',
      title: 'Time Investor',
      description: 'Invest 1000 minutes in your growth',
      icon: '⏰',
      background_color: '#F97316',
      criteria: { time_invested_minutes: 1000 }
    },
    {
      key: 'consistency_champion',
      title: 'Consistency Champion',
      description: 'Maintain a 30-day streak',
      icon: '🏆',
      background_color: '#DC2626',
      criteria: { streak: 30 }
    }
  ]
  
  for (const achievement of achievements) {
    await query(
      `INSERT INTO achievements (key, title, description, icon, background_color, criteria)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (key) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         background_color = EXCLUDED.background_color,
         criteria = EXCLUDED.criteria`,
      [
        achievement.key,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.background_color,
        JSON.stringify(achievement.criteria)
      ]
    )
  }
  
  console.log(`✅ Inserted ${achievements.length} default achievements`)
}

/**
 * Insert system defaults and configuration
 */
async function insertSystemDefaults(): Promise<void> {
  console.log('⚙️ Setting up system defaults...')
  
  // Create analytics partitions for the next year
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_events_${nextYear} 
      PARTITION OF analytics_events
      FOR VALUES FROM ('${nextYear}-01-01') TO ('${nextYear + 1}-01-01')
    `)
    
    await query(`
      CREATE TABLE IF NOT EXISTS audit_log_${nextYear}
      PARTITION OF audit_log  
      FOR VALUES FROM ('${nextYear}-01-01') TO ('${nextYear + 1}-01-01')
    `)
    
    console.log(`✅ Created analytics partitions for ${nextYear}`)
  } catch (error) {
    console.warn('Warning: Could not create future partitions:', error)
  }
}

/**
 * Check database health and connectivity
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  version?: string
  migrations_applied: number
  last_migration?: string
  error?: string
}> {
  try {
    // Test basic connectivity
    const versionResult = await query<{ version: string }>('SELECT version()')
    
    // Get migration status
    const migrationResult = await query<{ count: string, version: string }>(
      'SELECT COUNT(*) as count, MAX(version) as version FROM schema_migrations'
    )
    
    return {
      connected: true,
      version: versionResult[0]?.version,
      migrations_applied: parseInt(migrationResult[0]?.count || '0'),
      last_migration: migrationResult[0]?.version
    }
    
  } catch (error) {
    return {
      connected: false,
      migrations_applied: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Reset database (DANGER: Only for development)
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is not allowed in production')
  }
  
  console.log('⚠️ RESETTING DATABASE - ALL DATA WILL BE LOST!')
  
  const client = await getMigrationConnection()
  
  try {
    // Drop all tables in correct order
    await client.query('DROP SCHEMA public CASCADE')
    await client.query('CREATE SCHEMA public')
    await client.query('GRANT ALL ON SCHEMA public TO postgres')
    await client.query('GRANT ALL ON SCHEMA public TO public')
    
    console.log('✅ Database reset complete')
    
    // Reinitialize
    await initializeDatabase()
    
  } finally {
    await client.end()
  }
}