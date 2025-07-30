import { useCallback } from 'react'
import { DailyAction, Vision } from '@/types'
import { useDailyActionsApi } from './useDailyActionsApi'
import { useVisionsApi } from './useVisionsApi'
import { generateDailyActions } from '@/lib/ai-client'

interface ActionTimerState {
  [actionId: string]: {
    timeSpent: number
    isRunning: boolean
    startTime?: number
  }
}

export function useDailyActions() {
  const { visions } = useVisionsApi()
  const {
    dailyActions,
    isLoading,
    error,
    currentDate,
    createBatchActions,
    updateAction,
    completeAction: apiCompleteAction,
    toggleActionComplete: apiToggleActionComplete,
    deleteAction,
    startTimer: apiStartTimer,
    stopTimer: apiStopTimer,
    completedActions,
    totalActions,
    completionRate,
    allActionsComplete,
    getAction,
    getActionsByVision,
    getActionsByStatus
  } = useDailyActionsApi()

  // Generate daily actions based on time budget and visions
  const generateActions = useCallback(async (activeVisions: Vision[]) => {
    try {
      // Use the secure AI client to generate actions
      const response = await generateDailyActions(activeVisions)
      
      if (response.success && response.data) {
        // Transform AI response to CreateActionInput format
        const actionsToCreate = response.data.map(action => ({
          visionId: action.visionId,
          description: action.description,
          estimatedTime: action.estimatedTime,
          date: currentDate,
          aiGenerated: true,
          aiReasoning: action.aiReasoning
        }))

        // Create actions via API
        const createdActions = await createBatchActions(actionsToCreate)
        return createdActions
      } else {
        throw new Error(response.error || 'Failed to generate actions')
      }
    } catch (error) {
      console.error('Failed to generate daily actions:', error)
      return []
    }
  }, [createBatchActions, currentDate])

  // Complete an action with time tracking
  const completeAction = useCallback(async (actionId: string, actualTime?: number) => {
    const actualTimeMinutes = actualTime ? Math.round(actualTime / 60) : undefined
    return await apiCompleteAction(actionId, actualTimeMinutes)
  }, [apiCompleteAction])

  // Toggle action completion
  const toggleActionComplete = useCallback(async (actionId: string) => {
    await apiToggleActionComplete(actionId)
  }, [apiToggleActionComplete])

  // Timer management - simplified interface compatible with existing code
  const startTimer = useCallback(async (actionId: string) => {
    const timer = await apiStartTimer(actionId)
    return !!timer
  }, [apiStartTimer])

  const pauseTimer = useCallback(async (actionId: string) => {
    const timer = await apiStopTimer(actionId)
    return !!timer
  }, [apiStopTimer])

  const stopTimer = useCallback(async (actionId: string) => {
    const timer = await apiStopTimer(actionId)
    return !!timer
  }, [apiStopTimer])

  // Get timer state for compatibility
  const getTimerState = useCallback((actionId: string) => {
    const action = getAction(actionId)
    if (!action) return { timeSpent: 0, isRunning: false }
    
    // This is a simplified implementation
    // In a real implementation, you'd track active timers
    return {
      timeSpent: action.actualTime ? action.actualTime * 60 : 0, // Convert to seconds
      isRunning: action.status === 'in_progress'
    }
  }, [getAction])

  // Update timer time (simplified for compatibility)
  const updateTimerTime = useCallback(async (actionId: string, timeSpent: number) => {
    const timeMinutes = Math.round(timeSpent / 60)
    await updateAction(actionId, { actualTime: timeMinutes })
  }, [updateAction])

  // Clear actions for a date
  const clearActions = useCallback(async () => {
    // Delete all actions for today
    for (const action of dailyActions) {
      await deleteAction(action.id)
    }
  }, [dailyActions, deleteAction])

  // Regenerate actions
  const regenerateActions = useCallback(async () => {
    if (visions.length > 0) {
      // Clear existing actions first
      await clearActions()
      
      // Generate new actions
      const activeVisions = visions.filter(v => v.isActive)
      await generateActions(activeVisions)
    }
  }, [visions, clearActions, generateActions])

  // Calculate time statistics for compatibility
  const actionTimers: ActionTimerState = dailyActions.reduce((timers, action) => {
    timers[action.id] = {
      timeSpent: action.actualTime ? action.actualTime * 60 * 1000 : 0, // Convert to milliseconds
      isRunning: action.status === 'in_progress',
      startTime: action.status === 'in_progress' ? Date.now() : undefined
    }
    return timers
  }, {} as ActionTimerState)

  const totalTimeSpent = Object.values(actionTimers).reduce((sum, timer) => sum + timer.timeSpent, 0)
  const estimatedTotalTime = dailyActions.reduce((sum, action) => sum + (action.estimatedTime * 60), 0)
  const timeSavings = estimatedTotalTime - totalTimeSpent

  return {
    // State
    dailyActions,
    currentDate,
    isLoading,
    error,
    
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
    generateActions,
    
    // Timer actions
    startTimer,
    pauseTimer,
    stopTimer,
    updateTimerTime,
    getTimerState,
    
    // Getters
    getAction,
    getActionsByVision,
    getActionsByStatus
  }
}