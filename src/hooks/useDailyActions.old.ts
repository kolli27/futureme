import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useVisions } from './useVisions'
import { useTimeBudget } from './useTimeBudget'
import { DailyAction } from '@/types'
import { generateDailyActions } from '@/lib/ai-client'
import { mockAI } from '@/utils/aiUtils'

interface ActionTimerState {
  [actionId: string]: {
    timeSpent: number
    isRunning: boolean
    startTime?: number
  }
}

export function useDailyActions() {
  const { visions } = useVisions()
  const { allocations } = useTimeBudget()
  const [dailyActions, setDailyActions] = useLocalStorage<DailyAction[]>('daily-actions', [])
  const [actionTimers, setActionTimers] = useLocalStorage<ActionTimerState>('action-timers', {})
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0])

  // Generate daily actions based on time budget and visions
  useEffect(() => {
    const shouldGenerateActions = 
      visions.length > 0 && 
      Object.keys(allocations).length > 0 && 
      dailyActions.length === 0

    const actionsOutdated = dailyActions.length > 0 && 
      dailyActions.some(action => action.date !== currentDate)

    if (shouldGenerateActions || actionsOutdated) {
      // Filter visions that have time allocated
      const activeVisions = visions.filter(vision => 
        allocations[vision.id] && allocations[vision.id] > 0
      )

      if (activeVisions.length > 0) {
        // Generate AI-powered daily actions with secure API calls
        generateDailyActions(activeVisions)
          .then(response => {
            if (response.success && response.data) {
              const aiActions = response.data
              
              // Adjust action estimated times based on time allocations
              const adjustedActions = aiActions.map(action => {
                const vision = activeVisions.find(v => v.id === action.visionId)
                if (vision && allocations[vision.id]) {
                  // Use a portion of the allocated time for this action
                  const allocatedMinutes = allocations[vision.id]
                  const adjustedTime = Math.min(action.estimatedTime, Math.floor(allocatedMinutes * 0.7))
                  return { ...action, estimatedTime: Math.max(adjustedTime, 5) } // Minimum 5 minutes
                }
                return action
              })

              setDailyActions(adjustedActions)
            } else {
              // Fallback on AI failure - the AI service already provides fallback actions
              if (response.data) {
                const adjustedActions = response.data.map(action => {
                  const vision = activeVisions.find(v => v.id === action.visionId)
                  if (vision && allocations[vision.id]) {
                    const allocatedMinutes = allocations[vision.id]
                    const adjustedTime = Math.min(action.estimatedTime, Math.floor(allocatedMinutes * 0.7))
                    return { ...action, estimatedTime: Math.max(adjustedTime, 5) }
                  }
                  return action
                })
                setDailyActions(adjustedActions)
              }
            }
            
            // Clear old timer data if actions are outdated
            if (actionsOutdated) {
              setActionTimers({})
            }
          })
          .catch(error => {
            console.error('Failed to generate daily actions:', error)
            // Ultimate fallback to mock actions
            const fallbackActions = mockAI.generateDailyActions(activeVisions, currentDate)
            const adjustedActions = fallbackActions.map(action => {
              const vision = activeVisions.find(v => v.id === action.visionId)
              if (vision && allocations[vision.id]) {
                const allocatedMinutes = allocations[vision.id]
                const adjustedTime = Math.min(action.estimatedTime, Math.floor(allocatedMinutes * 0.7))
                return { ...action, estimatedTime: Math.max(adjustedTime, 5) }
              }
              return action
            })
            setDailyActions(adjustedActions)
            
            if (actionsOutdated) {
              setActionTimers({})
            }
          })
      }
    }
  }, [visions, allocations, dailyActions, currentDate, setDailyActions, setActionTimers])

  // Calculate progress metrics
  const completedActions = dailyActions.filter(action => action.completed)
  const totalActions = dailyActions.length
  const completionRate = totalActions > 0 ? (completedActions.length / totalActions) * 100 : 0
  const allActionsComplete = totalActions > 0 && completedActions.length === totalActions

  // Calculate time statistics
  const totalTimeSpent = Object.values(actionTimers).reduce((sum, timer) => sum + timer.timeSpent, 0)
  const estimatedTotalTime = dailyActions.reduce((sum, action) => sum + (action.estimatedTime * 60), 0)
  const timeSavings = estimatedTotalTime - totalTimeSpent

  // Complete an action
  const completeAction = useCallback((actionId: string, actualTime?: number) => {
    setDailyActions(prev => prev.map(action => 
      action.id === actionId 
        ? { 
            ...action, 
            completed: true, 
            actualTime: actualTime ? Math.round(actualTime / 60) : action.estimatedTime 
          }
        : action
    ))

    // Stop timer if running
    setActionTimers(prev => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        isRunning: false,
        timeSpent: actualTime || prev[actionId]?.timeSpent || 0
      }
    }))
  }, [setDailyActions, setActionTimers])

  // Toggle action completion
  const toggleActionComplete = useCallback((actionId: string) => {
    setDailyActions(prev => prev.map(action => {
      if (action.id === actionId) {
        const newCompleted = !action.completed
        return {
          ...action,
          completed: newCompleted,
          actualTime: newCompleted && !action.actualTime ? action.estimatedTime : action.actualTime
        }
      }
      return action
    }))

    // Stop timer if marking as complete
    const action = dailyActions.find(a => a.id === actionId)
    if (action && !action.completed) {
      setActionTimers(prev => ({
        ...prev,
        [actionId]: {
          ...prev[actionId],
          isRunning: false
        }
      }))
    }
  }, [dailyActions, setDailyActions, setActionTimers])

  // Start timer for an action
  const startTimer = useCallback((actionId: string) => {
    setActionTimers(prev => ({
      ...prev,
      [actionId]: {
        timeSpent: prev[actionId]?.timeSpent || 0,
        isRunning: true,
        startTime: Date.now()
      }
    }))
  }, [setActionTimers])

  // Pause timer for an action
  const pauseTimer = useCallback((actionId: string) => {
    setActionTimers(prev => {
      const current = prev[actionId]
      if (current?.isRunning && current.startTime) {
        const additionalTime = Date.now() - current.startTime
        return {
          ...prev,
          [actionId]: {
            timeSpent: current.timeSpent + additionalTime,
            isRunning: false
          }
        }
      }
      return {
        ...prev,
        [actionId]: {
          ...current,
          isRunning: false
        }
      }
    })
  }, [setActionTimers])

  // Stop and reset timer for an action
  const stopTimer = useCallback((actionId: string) => {
    setActionTimers(prev => ({
      ...prev,
      [actionId]: {
        timeSpent: 0,
        isRunning: false
      }
    }))
  }, [setActionTimers])

  // Update timer time
  const updateTimerTime = useCallback((actionId: string, timeSpent: number) => {
    setActionTimers(prev => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        timeSpent: timeSpent * 1000 // Convert to milliseconds
      }
    }))
  }, [setActionTimers])

  // Get timer state for an action
  const getTimerState = useCallback((actionId: string) => {
    const timer = actionTimers[actionId]
    return {
      timeSpent: timer ? Math.floor(timer.timeSpent / 1000) : 0, // Convert to seconds
      isRunning: timer?.isRunning || false
    }
  }, [actionTimers])

  // Clear all actions (for testing or reset)
  const clearActions = useCallback(() => {
    setDailyActions([])
    setActionTimers({})
  }, [setDailyActions, setActionTimers])

  // Regenerate actions
  const regenerateActions = useCallback(() => {
    if (visions.length > 0) {
      generateDailyActions(visions)
        .then(response => {
          if (response.success && response.data) {
            setDailyActions(response.data)
          } else if (response.data) {
            // Use fallback actions provided by AI service
            setDailyActions(response.data)
          } else {
            // Ultimate fallback to mock actions
            const fallbackActions = mockAI.generateDailyActions(visions, currentDate)
            setDailyActions(fallbackActions)
          }
          setActionTimers({})
        })
        .catch(error => {
          console.error('Failed to regenerate actions:', error)
          // Fallback to mock actions on error
          const fallbackActions = mockAI.generateDailyActions(visions, currentDate)
          setDailyActions(fallbackActions)
          setActionTimers({})
        })
    }
  }, [visions, currentDate, setDailyActions, setActionTimers])

  return {
    // State
    dailyActions,
    currentDate,
    
    // Metrics
    completedActions,
    totalActions,
    completionRate,
    allActionsComplete,
    totalTimeSpent: Math.floor(totalTimeSpent / 1000), // Convert to seconds
    estimatedTotalTime,
    timeSavings: Math.floor(timeSavings - (totalTimeSpent / 1000)),
    
    // Actions
    completeAction,
    toggleActionComplete,
    clearActions,
    regenerateActions,
    
    // Timer actions
    startTimer,
    pauseTimer,
    stopTimer,
    updateTimerTime,
    getTimerState
  }
}