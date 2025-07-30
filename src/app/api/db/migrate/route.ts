/**
 * Database Migration API Endpoint
 * 
 * Handles localStorage to PostgreSQL migration for users.
 * Provides secure migration endpoint with proper validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  migrateUserFromLocalStorage, 
  isMigrationCompleted, 
  previewMigrationData 
} from '@/lib/db/migrations/localStorage-to-postgresql'

// Rate limiting for migration attempts
const migrationAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 3
const ATTEMPT_WINDOW = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    
    // Check rate limiting
    const now = Date.now()
    const userAttempts = migrationAttempts.get(userId)
    
    if (userAttempts) {
      if (now - userAttempts.lastAttempt < ATTEMPT_WINDOW) {
        if (userAttempts.count >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { 
              error: 'Too many migration attempts. Please wait before trying again.',
              retryAfter: Math.ceil((ATTEMPT_WINDOW - (now - userAttempts.lastAttempt)) / 1000)
            },
            { status: 429 }
          )
        }
      } else {
        // Reset counter after window expires
        migrationAttempts.delete(userId)
      }
    }

    // Parse request body
    const body = await request.json()
    const { action, previewOnly = false } = body

    if (!action || !['migrate', 'preview'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "migrate" or "preview"' },
        { status: 400 }
      )
    }

    // Handle preview request
    if (action === 'preview' || previewOnly) {
      const previewData = previewMigrationData()
      
      return NextResponse.json({
        success: true,
        action: 'preview',
        data: previewData,
        migration_completed: isMigrationCompleted()
      })
    }

    // Check if migration already completed
    if (isMigrationCompleted()) {
      return NextResponse.json({
        success: true,
        message: 'Migration already completed',
        migration_completed: true
      })
    }

    // Record migration attempt
    const currentAttempts = migrationAttempts.get(userId) || { count: 0, lastAttempt: 0 }
    migrationAttempts.set(userId, {
      count: currentAttempts.count + 1,
      lastAttempt: now
    })

    // Perform migration
    const migrationResult = await migrateUserFromLocalStorage(
      userId,
      session.user.email || '',
      session.user.name || 'User'
    )

    if (migrationResult.success) {
      // Clear rate limiting on successful migration
      migrationAttempts.delete(userId)
      
      return NextResponse.json({
        success: true,
        action: 'migrate',
        message: 'Migration completed successfully',
        data: migrationResult.migratedData,
        warnings: migrationResult.warnings
      })
    } else {
      return NextResponse.json({
        success: false,
        action: 'migrate',
        message: 'Migration failed',
        errors: migrationResult.errors,
        warnings: migrationResult.warnings
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Migration API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during migration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return migration status and preview
    const migrationCompleted = isMigrationCompleted()
    const previewData = previewMigrationData()

    return NextResponse.json({
      migration_completed: migrationCompleted,
      preview: previewData,
      can_migrate: !migrationCompleted && (
        previewData.visions > 0 || 
        previewData.dailyActions > 0 || 
        previewData.hasProgress
      )
    })

  } catch (error) {
    console.error('Migration status API error:', error)
    
    return NextResponse.json({
      error: 'Failed to get migration status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}