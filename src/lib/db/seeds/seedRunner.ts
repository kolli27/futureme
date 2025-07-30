/**
 * Database Seed Runner
 * 
 * Utility to run seed data scripts for different environments
 * with proper validation and rollback capabilities.
 */

import fs from 'fs/promises'
import path from 'path'
import { getMigrationConnection } from '../config'
import { Client } from 'pg'

interface SeedResult {
  success: boolean
  environment: string
  tablesSeeded: string[]
  recordsCreated: number
  executionTime: number
  error?: string
}

/**
 * Run seed data for a specific environment
 */
export async function runSeeds(environment: 'development' | 'production' | 'test'): Promise<SeedResult> {
  console.log(`🌱 Running ${environment} seed data...`)
  
  const startTime = Date.now()
  const result: SeedResult = {
    success: false,
    environment,
    tablesSeeded: [],
    recordsCreated: 0,
    executionTime: 0
  }

  let client: Client | null = null

  try {
    // Validate environment
    if (environment === 'production' && process.env.NODE_ENV === 'production') {
      throw new Error('Seed data should not be run in production environment')
    }

    client = await getMigrationConnection()
    
    // Read seed file
    const seedFile = path.join(__dirname, `${environment}.sql`)
    const seedSql = await fs.readFile(seedFile, 'utf8')

    // Execute seed data in a transaction
    await client.query('BEGIN')

    try {
      // Split SQL into statements (basic approach)
      const statements = seedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      console.log(`📝 Executing ${statements.length} seed statements...`)

      let recordCount = 0
      const tablesSet = new Set<string>()

      for (const statement of statements) {
        if (statement.toUpperCase().includes('INSERT INTO') || 
            statement.toUpperCase().includes('CREATE') ||
            statement.toUpperCase().includes('UPDATE')) {
          
          const queryResult = await client.query(statement)
          
          // Track tables being seeded
          const tableName = extractTableName(statement)
          if (tableName) {
            tablesSet.add(tableName)
          }
          
          // Count inserted records
          if (queryResult.rowCount) {
            recordCount += queryResult.rowCount
          }
        } else if (statement.trim()) {
          // Execute other statements (like CREATE VIEW)
          await client.query(statement)
        }
      }

      await client.query('COMMIT')
      
      result.success = true
      result.tablesSeeded = Array.from(tablesSet)
      result.recordsCreated = recordCount
      result.executionTime = Date.now() - startTime

      console.log(`✅ Seed data completed successfully:`)
      console.log(`   - Tables seeded: ${result.tablesSeeded.join(', ')}`)
      console.log(`   - Records created: ${result.recordsCreated}`)
      console.log(`   - Execution time: ${result.executionTime}ms`)

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Seed data failed:`, error)
  } finally {
    if (client) {
      await client.end()
    }
  }

  return result
}

/**
 * Clear all seed data (for testing)
 */
export async function clearSeedData(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Clearing seed data is not allowed in production')
  }

  console.log('🧹 Clearing existing seed data...')
  
  const client = await getMigrationConnection()

  try {
    await client.query('BEGIN')

    // Delete in reverse dependency order
    const deleteQueries = [
      "DELETE FROM audit_log WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM analytics_events WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_notifications WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_achievements WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM victory_post_interactions WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM victory_posts WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM action_timing_sessions WHERE action_id IN (SELECT id FROM daily_actions WHERE user_id LIKE 'user_demo_%')",
      "DELETE FROM daily_actions WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM vision_time_allocations WHERE budget_allocation_id IN (SELECT id FROM time_budget_allocations WHERE user_id LIKE 'user_demo_%')",
      "DELETE FROM time_budget_allocations WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM vision_ai_analysis WHERE vision_id IN (SELECT id FROM visions WHERE user_id LIKE 'user_demo_%')",
      "DELETE FROM visions WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_notification_preferences WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_subscriptions WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_progress WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM user_oauth_providers WHERE user_id LIKE 'user_demo_%'",
      "DELETE FROM users WHERE id LIKE 'user_demo_%'"
    ]

    for (const query of deleteQueries) {
      await client.query(query)
    }

    await client.query('COMMIT')
    console.log('✅ Seed data cleared successfully')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to clear seed data:', error)
    throw error
  } finally {
    await client.end()
  }
}

/**
 * Check if seed data exists
 */
export async function hasSeedData(): Promise<{
  hasUsers: boolean
  hasVisions: boolean
  hasActions: boolean
  userCount: number
}> {
  const client = await getMigrationConnection()

  try {
    const usersResult = await client.query("SELECT COUNT(*) as count FROM users WHERE id LIKE 'user_demo_%'")
    const visionsResult = await client.query("SELECT COUNT(*) as count FROM visions WHERE user_id LIKE 'user_demo_%'")
    const actionsResult = await client.query("SELECT COUNT(*) as count FROM daily_actions WHERE user_id LIKE 'user_demo_%'")

    const userCount = parseInt(usersResult.rows[0].count)
    const visionCount = parseInt(visionsResult.rows[0].count)
    const actionCount = parseInt(actionsResult.rows[0].count)

    return {
      hasUsers: userCount > 0,
      hasVisions: visionCount > 0,
      hasActions: actionCount > 0,
      userCount
    }

  } finally {
    await client.end()
  }
}

/**
 * Create a fresh development environment
 */
export async function setupDevelopmentEnvironment(): Promise<SeedResult> {
  console.log('🔧 Setting up fresh development environment...')

  // Clear existing seed data if any
  const seedStatus = await hasSeedData()
  if (seedStatus.hasUsers) {
    console.log('🧹 Clearing existing seed data...')
    await clearSeedData()
  }

  // Run development seeds
  return await runSeeds('development')
}

/**
 * Generate performance test data
 */
export async function generatePerformanceTestData(userCount: number = 1000): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Performance test data generation not allowed in production')
  }

  console.log(`🚀 Generating performance test data for ${userCount} users...`)
  
  const client = await getMigrationConnection()

  try {
    await client.query('BEGIN')

    // Generate users in batches
    const batchSize = 100
    for (let i = 0; i < userCount; i += batchSize) {
      const values: string[] = []
      const params: any[] = []
      
      for (let j = 0; j < batchSize && (i + j) < userCount; j++) {
        const userIndex = i + j + 1
        const userId = `perf_user_${userIndex}`
        
        values.push(`($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, true, CURRENT_TIMESTAMP - INTERVAL '${Math.floor(Math.random() * 365)} days')`)
        params.push(
          userId,
          `testuser${userIndex}@example.com`,
          `Test User ${userIndex}`
        )
      }

      if (values.length > 0) {
        await client.query(
          `INSERT INTO users (id, email, name, onboarding_completed, created_at) VALUES ${values.join(', ')}`,
          params
        )
      }
    }

    await client.query('COMMIT')
    console.log(`✅ Generated ${userCount} performance test users`)

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

/**
 * Helper function to extract table name from SQL statement
 */
function extractTableName(sql: string): string | null {
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i)
  if (insertMatch) return insertMatch[1]
  
  const updateMatch = sql.match(/UPDATE\s+(\w+)/i)
  if (updateMatch) return updateMatch[1]
  
  const createMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)
  if (createMatch) return createMatch[1]
  
  return null
}

/**
 * CLI runner for seed scripts
 */
export async function runSeedCLI(): Promise<void> {
  const command = process.argv[2]
  const environment = (process.argv[3] || 'development') as 'development' | 'production' | 'test'

  try {
    switch (command) {
      case 'run':
        await runSeeds(environment)
        break
      
      case 'clear':
        await clearSeedData()
        break
      
      case 'setup':
        await setupDevelopmentEnvironment()
        break
      
      case 'check':
        const status = await hasSeedData()
        console.log('Seed data status:', status)
        break
      
      case 'perf':
        const userCount = parseInt(process.argv[4] || '1000')
        await generatePerformanceTestData(userCount)
        break
      
      default:
        console.log(`
Usage: npm run seeds <command> [environment] [options]

Commands:
  run [env]       Run seed data for environment (development, test)
  clear           Clear all seed data
  setup           Setup fresh development environment
  check           Check current seed data status
  perf [count]    Generate performance test data

Examples:
  npm run seeds run development
  npm run seeds setup
  npm run seeds perf 5000
        `)
    }
  } catch (error) {
    console.error('Seed operation failed:', error)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  runSeedCLI()
}