/**
 * Database Configuration for FutureSync Production
 * 
 * Handles PostgreSQL connection configuration, connection pooling,
 * and database client initialization for production scale.
 */

import { Pool, PoolClient, PoolConfig } from 'pg'

// Database configuration interface
interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean | object
  maxConnections: number
  idleTimeoutMillis: number
  connectionTimeoutMillis: number
  statement_timeout: number
  query_timeout: number
}

// Environment-based configuration
const getDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'futurasync',
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000'),
    statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '25000'),
  }

  // SSL configuration for production
  if (process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: false, // For managed database services
      ca: process.env.DATABASE_CA_CERT,
      key: process.env.DATABASE_CLIENT_KEY,
      cert: process.env.DATABASE_CLIENT_CERT,
    }
  }

  return config
}

// PostgreSQL pool configuration
const createPoolConfig = (config: DatabaseConfig): PoolConfig => ({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.username,
  password: config.password,
  ssl: config.ssl,
  max: config.maxConnections,
  idleTimeoutMillis: config.idleTimeoutMillis,
  connectionTimeoutMillis: config.connectionTimeoutMillis,
  statement_timeout: config.statement_timeout,
  query_timeout: config.query_timeout,
  
  // Connection pool event handlers
  // onError: (err: Error, client: PoolClient) => {
  //   console.error('Unexpected error on idle client:', err)
  //   // Log to your monitoring service (e.g., Sentry, DataDog)
  // },
  
  // onConnect: (client: PoolClient) => {
  //   console.log('New client connected to database')
  //   // Set session-level configurations
  //   client.query('SET timezone TO UTC')
  //   client.query('SET statement_timeout TO $1', [config.statement_timeout])
  // },
  
  // onAcquire: (client: PoolClient) => {
  //   console.debug('Client acquired from pool')
  // },
})

// Global connection pool
let pool: Pool | null = null

/**
 * Get or create the database connection pool
 */
export const getPool = (): Pool => {
  if (!pool) {
    const config = getDatabaseConfig()
    const poolConfig = createPoolConfig(config)
    
    pool = new Pool(poolConfig)
    
    // Handle pool-level errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client pool:', err)
      // Log to monitoring service
    })
    
    pool.on('connect', () => {
      console.log('Database pool connected successfully')
    })
    
    pool.on('acquire', () => {
      console.debug('Database pool client acquired')
    })
    
    pool.on('release', () => {
      console.debug('Database pool client released')
    })
    
    console.log(`Database connection pool initialized with ${config.maxConnections} max connections`)
  }
  
  return pool
}

/**
 * Execute a query with automatic connection handling
 */
export const query = async <T = any>(text: string, params?: any[]): Promise<T[]> => {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    const start = Date.now()
    const result = await client.query(text, params)
    const duration = Date.now() - start
    
    // Log slow queries (>1000ms)
    if (duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100))
    }
    
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Execute a transaction with automatic rollback on error
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction rolled back due to error:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get a client for manual transaction management
 */
export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Close the database connection pool
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    pool = null
    console.log('Database connection pool closed')
  }
}

/**
 * Health check for database connectivity
 */
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  latency: number
  connections: {
    total: number
    idle: number
    waiting: number
  }
  error?: string
}> => {
  try {
    const start = Date.now()
    const pool = getPool()
    
    // Simple connectivity test
    await query('SELECT 1 as test')
    const latency = Date.now() - start
    
    return {
      status: 'healthy',
      latency,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: -1,
      connections: {
        total: 0,
        idle: 0,
        waiting: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Database connection URL builder for migrations and external tools
 */
export const getDatabaseUrl = (): string => {
  const config = getDatabaseConfig()
  const auth = `${config.username}:${config.password}`
  const host = `${config.host}:${config.port}`
  const sslParam = config.ssl ? '?sslmode=require' : ''
  
  return `postgresql://${auth}@${host}/${config.database}${sslParam}`
}

/**
 * Migration-specific connection (without pooling)
 */
export const getMigrationConnection = async () => {
  const { Client } = await import('pg')
  const config = getDatabaseConfig()
  
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl,
    statement_timeout: config.statement_timeout,
    query_timeout: config.query_timeout
  })
  
  await client.connect()
  return client
}

// Export configuration for external use
export { getDatabaseConfig }

// Default export for convenience
export default {
  getPool,
  query,
  transaction,
  getClient,
  closePool,
  healthCheck,
  getDatabaseUrl,
  getMigrationConnection
}