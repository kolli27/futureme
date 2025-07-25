// Data Export/Import Utilities for FutureSync
// Allows users to backup and restore their data

import { createDataBackup, restoreFromBackup } from './dataMigration'

/**
 * Export user data as a downloadable JSON file
 */
export function exportUserData(): void {
  try {
    const backupData = createDataBackup()
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `futurasync-backup-${timestamp}.json`
    
    // Create and trigger download
    const blob = new Blob([backupData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
    
    console.log(`✅ Data exported as ${filename}`)
    
  } catch (error) {
    console.error('Failed to export data:', error)
    throw new Error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Import user data from a JSON file
 */
export function importUserData(): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.style.display = 'none'
      
      input.onchange = async (event) => {
        try {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (!file) {
            resolve({ success: false, error: 'No file selected' })
            return
          }
          
          const text = await file.text()
          const result = restoreFromBackup(text)
          
          resolve(result)
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          resolve({ success: false, error: `Import failed: ${errorMsg}` })
        } finally {
          document.body.removeChild(input)
        }
      }
      
      input.oncancel = () => {
        resolve({ success: false, error: 'Import cancelled' })
        document.body.removeChild(input)
      }
      
      document.body.appendChild(input)
      input.click()
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      resolve({ success: false, error: `Import setup failed: ${errorMsg}` })
    }
  })
}

/**
 * Get data summary for export preview
 */
export function getDataSummary(): {
  visions: number
  dailyActions: number
  completedDays: number
  currentStreak: number
  totalTimeSpent: number
} {
  if (typeof window === 'undefined') {
    return { visions: 0, dailyActions: 0, completedDays: 0, currentStreak: 0, totalTimeSpent: 0 }
  }
  
  try {
    const visions = JSON.parse(localStorage.getItem('user-visions') || '[]')
    const actions = JSON.parse(localStorage.getItem('daily-actions') || '[]')
    const victory = JSON.parse(localStorage.getItem('victory-data') || '{}')
    const timers = JSON.parse(localStorage.getItem('action-timers') || '{}')
    
    // Calculate total time spent
    const totalTimeSpent = Object.values(timers).reduce((total: number, timer: any) => {
      return total + (timer.timeSpent || 0)
    }, 0)
    
    return {
      visions: visions.length,
      dailyActions: actions.length,
      completedDays: victory.totalDays || 0,
      currentStreak: victory.currentStreak || 0,
      totalTimeSpent: Math.floor(totalTimeSpent / 1000) // Convert to seconds
    }
    
  } catch (error) {
    console.error('Failed to get data summary:', error)
    return {
      visions: 0,
      dailyActions: 0,
      completedDays: 0,
      currentStreak: 0,
      totalTimeSpent: 0
    }
  }
}

/**
 * Validate backup file format
 */
export function validateBackupFile(backupJson: string): { isValid: boolean; error?: string; summary?: any } {
  try {
    const backup = JSON.parse(backupJson)
    
    // Check required fields
    if (!backup.version || !backup.data) {
      return { isValid: false, error: 'Invalid backup format: missing version or data' }
    }
    
    // Check data structure
    const { data } = backup
    const expectedKeys = ['visions', 'actions', 'budget', 'victory']
    const hasRequiredData = expectedKeys.some(key => data[key])
    
    if (!hasRequiredData) {
      return { isValid: false, error: 'Invalid backup: no user data found' }
    }
    
    // Create summary
    const summary = {
      version: backup.version,
      timestamp: backup.timestamp,
      visions: data.visions ? JSON.parse(data.visions).length : 0,
      actions: data.actions ? JSON.parse(data.actions).length : 0,
      hasTimeBudget: !!data.budget,
      hasProgress: !!data.victory
    }
    
    return { isValid: true, summary }
    
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid JSON format: ' + (error instanceof Error ? error.message : 'Parse error')
    }
  }
}