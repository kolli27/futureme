/**
 * Database Health Check API Endpoint
 * 
 * Provides comprehensive database health monitoring for production systems.
 * Used by load balancers, monitoring systems, and DevOps tools.
 */

import { NextRequest, NextResponse } from 'next/server'
import { healthCheck, checkDatabaseHealth } from '@/lib/db/setup'
import { query } from '@/lib/db/config'

export async function GET(request: NextRequest) {
  try {
    // Perform basic connectivity health check
    const basicHealth = await healthCheck()
    
    // Perform detailed database health check
    const detailedHealth = await checkDatabaseHealth()
    
    // Check table health (sample key tables)
    const tableHealthChecks = await Promise.allSettled([
      query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'),
      query('SELECT COUNT(*) as count FROM visions WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM daily_actions WHERE date = CURRENT_DATE'),
      query('SELECT COUNT(*) as count FROM user_progress'),
    ])

    const tableHealth = {
      users: tableHealthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      visions: tableHealthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      daily_actions: tableHealthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      user_progress: tableHealthChecks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    }

    // Check for any table issues
    const unhealthyTables = Object.entries(tableHealth)
      .filter(([_, status]) => status === 'unhealthy')
      .map(([table, _]) => table)

    // Determine overall status
    const isHealthy = basicHealth.status === 'healthy' && 
                     detailedHealth.connected && 
                     unhealthyTables.length === 0

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: detailedHealth.connected,
        version: detailedHealth.version,
        migrations_applied: detailedHealth.migrations_applied,
        last_migration: detailedHealth.last_migration,
        latency_ms: basicHealth.latency
      },
      connections: basicHealth.connections,
      tables: tableHealth,
      issues: [
        ...(basicHealth.error ? [`Connection: ${basicHealth.error}`] : []),
        ...(detailedHealth.error ? [`Database: ${detailedHealth.error}`] : []),
        ...unhealthyTables.map(table => `Table ${table} is unhealthy`)
      ]
    }

    // Return appropriate HTTP status
    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      issues: ['Health check system failure']
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}