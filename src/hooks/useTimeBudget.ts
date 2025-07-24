import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { TimeBudgetAllocation } from '@/types'

interface TimeBudgetState {
  totalAvailableTime: number
  allocations: { [visionId: string]: number }
  lastUpdated: string
}

export function useTimeBudget() {
  const [timeBudgetState, setTimeBudgetState] = useLocalStorage<TimeBudgetState>('time-budget-state', {
    totalAvailableTime: 180, // Default: 3 hours
    allocations: {},
    lastUpdated: new Date().toISOString()
  })
  
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0])
  
  // Calculate derived values
  const totalAllocated = Object.values(timeBudgetState.allocations).reduce((sum, time) => sum + time, 0)
  const remainingTime = timeBudgetState.totalAvailableTime - totalAllocated
  const isFullyAllocated = remainingTime === 0 && totalAllocated === timeBudgetState.totalAvailableTime

  // Reset allocations if it's a new day
  useEffect(() => {
    const lastUpdatedDate = new Date(timeBudgetState.lastUpdated).toISOString().split('T')[0]
    if (lastUpdatedDate !== currentDate) {
      setTimeBudgetState(prev => ({
        ...prev,
        allocations: {},
        lastUpdated: new Date().toISOString()
      }))
    }
  }, [currentDate, timeBudgetState.lastUpdated, setTimeBudgetState])

  // Update total available time
  const updateTotalTime = useCallback((timeMinutes: number) => {
    setTimeBudgetState(prev => {
      // If allocations exceed new total, proportionally reduce them
      const currentTotal = Object.values(prev.allocations).reduce((sum, time) => sum + time, 0)
      let newAllocations = prev.allocations
      
      if (currentTotal > timeMinutes) {
        const ratio = timeMinutes / currentTotal
        newAllocations = Object.entries(prev.allocations).reduce((acc, [visionId, time]) => ({
          ...acc,
          [visionId]: Math.floor(time * ratio / 5) * 5 // Round to nearest 5 minutes
        }), {})
      }
      
      return {
        totalAvailableTime: timeMinutes,
        allocations: newAllocations,
        lastUpdated: new Date().toISOString()
      }
    })
  }, [setTimeBudgetState])

  // Update allocation for a specific vision
  const updateAllocation = useCallback((visionId: string, timeMinutes: number) => {
    setTimeBudgetState(prev => {
      const otherAllocations = Object.entries(prev.allocations)
        .filter(([id]) => id !== visionId)
        .reduce((sum, [, time]) => sum + time, 0)
      
      // Ensure we don't exceed total available time
      const maxAllowable = prev.totalAvailableTime - otherAllocations
      const finalTime = Math.min(Math.max(timeMinutes, 0), maxAllowable)
      
      return {
        ...prev,
        allocations: {
          ...prev.allocations,
          [visionId]: finalTime
        },
        lastUpdated: new Date().toISOString()
      }
    })
  }, [setTimeBudgetState])

  // Assign all time equally across visions
  const assignAllTimeEqually = useCallback((visionIds: string[]) => {
    if (visionIds.length === 0) return
    
    const timePerVision = Math.floor(timeBudgetState.totalAvailableTime / visionIds.length / 5) * 5 // Round to nearest 5 minutes
    const remainder = timeBudgetState.totalAvailableTime - (timePerVision * visionIds.length)
    
    const newAllocations = visionIds.reduce((acc, visionId, index) => ({
      ...acc,
      [visionId]: timePerVision + (index === 0 ? remainder : 0) // Give remainder to first vision
    }), {})
    
    setTimeBudgetState(prev => ({
      ...prev,
      allocations: newAllocations,
      lastUpdated: new Date().toISOString()
    }))
  }, [timeBudgetState.totalAvailableTime, setTimeBudgetState])

  // Create final allocation object
  const createAllocation = useCallback((): TimeBudgetAllocation => {
    return {
      date: currentDate,
      totalAvailableTime: timeBudgetState.totalAvailableTime,
      allocations: Object.entries(timeBudgetState.allocations).map(([visionId, timeMinutes]) => ({
        visionId,
        timeMinutes
      }))
    }
  }, [currentDate, timeBudgetState])

  // Clear all allocations
  const clearAllocations = useCallback(() => {
    setTimeBudgetState(prev => ({
      ...prev,
      allocations: {},
      lastUpdated: new Date().toISOString()
    }))
  }, [setTimeBudgetState])

  return {
    // State
    totalAvailableTime: timeBudgetState.totalAvailableTime,
    allocations: timeBudgetState.allocations,
    lastUpdated: timeBudgetState.lastUpdated,
    
    // Derived values
    totalAllocated,
    remainingTime,
    isFullyAllocated,
    
    // Actions
    updateTotalTime,
    updateAllocation,
    assignAllTimeEqually,
    createAllocation,
    clearAllocations
  }
}