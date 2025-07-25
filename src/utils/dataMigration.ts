// Data Migration Utilities for FutureSync
// Handles localStorage schema updates and data migration between app versions

interface MigrationResult {
  success: boolean
  version: string
  migrationsApplied: string[]
  errors?: string[]
}

// Current app version - increment when making breaking changes
const CURRENT_VERSION = '1.0.0'
const VERSION_KEY = 'futurasync-app-version'

// Migration functions for each version
const migrations = {
  '0.9.0': migrate_0_9_0_to_1_0_0,
  // Add future migrations here
}

/**
 * Main migration function - runs all necessary migrations
 */
export function migrateUserData(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    version: CURRENT_VERSION,
    migrationsApplied: [],
    errors: []
  }

  // Skip migration if not in browser environment
  if (typeof window === 'undefined') {
    return result
  }

  try {
    const currentVersion = localStorage.getItem(VERSION_KEY) || '0.9.0'
    
    console.log(`🔄 Data Migration: ${currentVersion} → ${CURRENT_VERSION}`)
    
    // Skip if already on current version
    if (currentVersion === CURRENT_VERSION) {
      console.log('✅ Data is up to date, no migrations needed')
      return result
    }

    // Apply migrations in order
    for (const [version, migrationFn] of Object.entries(migrations)) {
      if (shouldApplyMigration(currentVersion, version)) {
        try {
          console.log(`🚀 Applying migration: ${version}`)
          migrationFn()
          result.migrationsApplied.push(version)
        } catch (error) {
          const errorMsg = `Failed migration ${version}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg)
          result.errors?.push(errorMsg)
          result.success = false
        }
      }
    }

    // Update version
    if (typeof window !== 'undefined') {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
    }
    console.log(`✅ Migration complete: ${result.migrationsApplied.length} migrations applied`)
    
  } catch (error) {
    result.success = false
    result.errors?.push(`Migration system error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Check if a migration should be applied
 */
function shouldApplyMigration(currentVersion: string, migrationVersion: string): boolean {
  // Simple version comparison - in production, use a proper semver library
  return compareVersions(currentVersion, migrationVersion) < 0
}

/**
 * Simple version comparison (for semver-like versions)
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0
    const bPart = bParts[i] || 0
    
    if (aPart < bPart) return -1
    if (aPart > bPart) return 1
  }
  
  return 0
}

/**
 * Migration from v0.9.0 to v1.0.0
 * - Adds AI analysis data to existing visions
 * - Updates daily actions format with AI metadata
 */
function migrate_0_9_0_to_1_0_0(): void {
  if (typeof window === 'undefined') return
  
  console.log('📝 Migrating visions to include AI analysis data...')
  
  // Migrate visions
  const visionsData = localStorage.getItem('user-visions')
  if (visionsData) {
    try {
      const visions = JSON.parse(visionsData)
      const updatedVisions = visions.map((vision: any) => ({
        ...vision,
        // Add AI analysis placeholder if missing
        aiAnalysis: vision.aiAnalysis || {
          themes: [vision.category, 'personal growth'],
          keyGoals: ['Build consistent habits'],
          suggestedActions: ['Take small daily steps'],
          timeComplexity: 'medium' as const,
          feasibilityScore: 0.8,
          improvements: ['Set more specific milestones']
        }
      }))
      
      localStorage.setItem('user-visions', JSON.stringify(updatedVisions))
      console.log(`✅ Migrated ${updatedVisions.length} visions`)
    } catch (error) {
      console.error('Failed to migrate visions:', error)
    }
  }

  // Migrate daily actions
  const actionsData = localStorage.getItem('daily-actions')
  if (actionsData) {
    try {
      const actions = JSON.parse(actionsData)
      const updatedActions = actions.map((action: any) => ({
        ...action,
        // Add AI metadata if missing
        aiGenerated: action.aiGenerated ?? true,
        aiReasoning: action.aiReasoning || 'Generated to support your transformation goals'
      }))
      
      localStorage.setItem('daily-actions', JSON.stringify(updatedActions))
      console.log(`✅ Migrated ${updatedActions.length} daily actions`)
    } catch (error) {
      console.error('Failed to migrate daily actions:', error)
    }
  }

  // Ensure victory data has proper structure
  const victoryData = localStorage.getItem('victory-data')
  if (victoryData) {
    try {
      const data = JSON.parse(victoryData)
      const updatedData = {
        currentStreak: data.currentStreak || 0,
        totalDays: data.totalDays || 0,
        lastCompletedDate: data.lastCompletedDate || '',
        victoryHistory: data.victoryHistory || []
      }
      
      localStorage.setItem('victory-data', JSON.stringify(updatedData))
      console.log('✅ Migrated victory data structure')
    } catch (error) {
      console.error('Failed to migrate victory data:', error)
    }
  }
}

/**
 * Get current app version
 */
export function getCurrentVersion(): string {
  if (typeof window === 'undefined') return '0.9.0'
  return localStorage.getItem(VERSION_KEY) || '0.9.0'
}

/**
 * Reset all user data (for testing or user-requested reset)
 */
export function resetAllUserData(): void {
  if (typeof window === 'undefined') return
  
  const keysToReset = [
    'user-visions',
    'daily-actions', 
    'action-timers',
    'time-budget-state',
    'victory-data',
    VERSION_KEY
  ]
  
  keysToReset.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('🗑️ All user data has been reset')
}

/**
 * Backup all user data to a JSON object
 */
export function createDataBackup(): string {
  if (typeof window === 'undefined') {
    return JSON.stringify({ version: CURRENT_VERSION, timestamp: new Date().toISOString(), data: {} })
  }
  
  const backup = {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    data: {
      visions: localStorage.getItem('user-visions'),
      actions: localStorage.getItem('daily-actions'),
      timers: localStorage.getItem('action-timers'),
      budget: localStorage.getItem('time-budget-state'),
      victory: localStorage.getItem('victory-data')
    }
  }
  
  return JSON.stringify(backup, null, 2)
}

/**
 * Restore user data from backup
 */
export function restoreFromBackup(backupJson: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' }
  }
  
  try {
    const backup = JSON.parse(backupJson)
    
    // Validate backup structure
    if (!backup.data || !backup.version) {
      throw new Error('Invalid backup format')
    }
    
    // Restore data
    Object.entries(backup.data).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const storageKey = key === 'actions' ? 'daily-actions' : 
                          key === 'timers' ? 'action-timers' :
                          key === 'budget' ? 'time-budget-state' :
                          key === 'victory' ? 'victory-data' :
                          key === 'visions' ? 'user-visions' : key
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, value)
        }
      }
    })
    
    // Set version
    if (typeof window !== 'undefined') {
      localStorage.setItem(VERSION_KEY, backup.version)
    }
    
    console.log('✅ Data restored from backup')
    return { success: true }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to restore backup:', errorMsg)
    return { success: false, error: errorMsg }
  }
}