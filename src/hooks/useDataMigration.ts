import { useEffect, useState } from 'react'
import { migrateUserData, getCurrentVersion } from '@/utils/dataMigration'

interface MigrationState {
  isComplete: boolean
  isLoading: boolean
  version: string
  migrationsApplied: string[]
  hasErrors: boolean
  errors?: string[]
}

export function useDataMigration() {
  const [migrationState, setMigrationState] = useState<MigrationState>({
    isComplete: false,
    isLoading: true,
    version: getCurrentVersion(),
    migrationsApplied: [],
    hasErrors: false
  })

  useEffect(() => {
    // Run migrations on app startup
    const runMigrations = async () => {
      try {
        setMigrationState(prev => ({ ...prev, isLoading: true }))
        
        // Add small delay to prevent blocking UI
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const result = migrateUserData()
        
        setMigrationState({
          isComplete: true,
          isLoading: false,
          version: result.version,
          migrationsApplied: result.migrationsApplied,
          hasErrors: !result.success,
          errors: result.errors
        })
        
        if (result.errors && result.errors.length > 0) {
          console.warn('Data migration completed with errors:', result.errors)
        }
        
      } catch (error) {
        console.error('Migration system failed:', error)
        setMigrationState({
          isComplete: false,
          isLoading: false,
          version: getCurrentVersion(),
          migrationsApplied: [],
          hasErrors: true,
          errors: [error instanceof Error ? error.message : 'Unknown migration error']
        })
      }
    }

    runMigrations()
  }, [])

  return migrationState
}