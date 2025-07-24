import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface VictoryData {
  currentStreak: number
  totalDays: number
  lastCompletedDate: string
  victoryHistory: VictoryRecord[]
}

interface VictoryRecord {
  date: string
  dayNumber: number
  actionsCompleted: number
  totalActions: number
  timeSpent: number // in seconds
}

export function useVictory() {
  const [victoryData, setVictoryData] = useLocalStorage<VictoryData>('victory-data', {
    currentStreak: 0,
    totalDays: 0,
    lastCompletedDate: '',
    victoryHistory: []
  })

  const [showVictory, setShowVictory] = useState(false)
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0])

  // Check if today has already been completed
  const isTodayComplete = victoryData.lastCompletedDate === currentDate

  // Calculate if streak should be broken (missed a day)
  useEffect(() => {
    if (victoryData.lastCompletedDate && !isTodayComplete) {
      const lastDate = new Date(victoryData.lastCompletedDate)
      const today = new Date(currentDate)
      const daysDifference = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // If more than 1 day gap, break the streak
      if (daysDifference > 1) {
        setVictoryData(prev => ({
          ...prev,
          currentStreak: 0
        }))
      }
    }
  }, [currentDate, victoryData.lastCompletedDate, isTodayComplete, setVictoryData])

  // Record a victory (when all daily actions are completed)
  const recordVictory = useCallback((actionsCompleted: number, totalActions: number, timeSpent: number) => {
    if (isTodayComplete) return // Already completed today

    const newDayNumber = victoryData.totalDays + 1
    const newStreak = victoryData.lastCompletedDate === getPreviousDate(currentDate) 
      ? victoryData.currentStreak + 1 
      : 1

    const victoryRecord: VictoryRecord = {
      date: currentDate,
      dayNumber: newDayNumber,
      actionsCompleted,
      totalActions,
      timeSpent
    }

    setVictoryData(prev => ({
      currentStreak: newStreak,
      totalDays: newDayNumber,
      lastCompletedDate: currentDate,
      victoryHistory: [...prev.victoryHistory, victoryRecord]
    }))

    setShowVictory(true)
  }, [currentDate, victoryData, isTodayComplete, setVictoryData])

  // Show victory screen
  const triggerVictory = useCallback(() => {
    setShowVictory(true)
  }, [])

  // Hide victory screen
  const dismissVictory = useCallback(() => {
    setShowVictory(false)
  }, [])

  // Get current day number for display
  const getCurrentDayNumber = useCallback(() => {
    return isTodayComplete 
      ? victoryData.totalDays 
      : victoryData.totalDays + 1
  }, [victoryData.totalDays, isTodayComplete])

  // Get motivational message based on streak
  const getMotivationalMessage = useCallback(() => {
    const streak = victoryData.currentStreak
    const dayNumber = getCurrentDayNumber()

    if (streak === 1) {
      return "Amazing start! You've taken the first step on your transformation journey."
    } else if (streak < 7) {
      return `${streak} days in a row! You're building unstoppable momentum.`
    } else if (streak < 30) {
      return `${streak} day streak! Your consistency is creating real change.`
    } else if (streak < 100) {
      return `${streak} days! You're proving that transformation is possible through daily action.`
    } else {
      return `${streak} days! You're an inspiration - your dedication is extraordinary!`
    }
  }, [victoryData.currentStreak, getCurrentDayNumber])

  // Get recent victories for display
  const getRecentVictories = useCallback((limit: number = 7) => {
    return victoryData.victoryHistory
      .slice(-limit)
      .reverse()
  }, [victoryData.victoryHistory])

  // Get victory statistics
  const getVictoryStats = useCallback(() => {
    const totalTimeSpent = victoryData.victoryHistory.reduce((sum, record) => sum + record.timeSpent, 0)
    const averageActionsPerDay = victoryData.victoryHistory.length > 0 
      ? victoryData.victoryHistory.reduce((sum, record) => sum + record.actionsCompleted, 0) / victoryData.victoryHistory.length
      : 0
    const bestStreak = Math.max(victoryData.currentStreak, ...getStreakHistory())

    return {
      currentStreak: victoryData.currentStreak,
      totalDays: victoryData.totalDays,
      totalTimeSpent: Math.floor(totalTimeSpent / 60), // Convert to minutes
      averageActionsPerDay: Math.round(averageActionsPerDay * 10) / 10,
      bestStreak,
      completionRate: victoryData.victoryHistory.length > 0 
        ? (victoryData.victoryHistory.reduce((sum, record) => sum + (record.actionsCompleted / record.totalActions), 0) / victoryData.victoryHistory.length) * 100
        : 0
    }
  }, [victoryData])

  // Helper function to get streak history
  const getStreakHistory = useCallback(() => {
    const streaks: number[] = []
    let currentStreak = 0
    
    // This is a simplified version - in production you'd want more sophisticated streak calculation
    victoryData.victoryHistory.forEach((record, index) => {
      const prevRecord = victoryData.victoryHistory[index - 1]
      if (!prevRecord || isConsecutiveDay(prevRecord.date, record.date)) {
        currentStreak++
      } else {
        if (currentStreak > 0) streaks.push(currentStreak)
        currentStreak = 1
      }
    })
    
    if (currentStreak > 0) streaks.push(currentStreak)
    return streaks
  }, [victoryData.victoryHistory])

  // Reset all victory data (for testing or fresh start)
  const resetVictoryData = useCallback(() => {
    setVictoryData({
      currentStreak: 0,
      totalDays: 0,
      lastCompletedDate: '',
      victoryHistory: []
    })
    setShowVictory(false)
  }, [setVictoryData])

  return {
    // State
    victoryData,
    showVictory,
    isTodayComplete,
    
    // Actions
    recordVictory,
    triggerVictory,
    dismissVictory,
    resetVictoryData,
    
    // Getters
    getCurrentDayNumber,
    getMotivationalMessage,
    getRecentVictories,
    getVictoryStats
  }
}

// Helper functions
function getPreviousDate(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}