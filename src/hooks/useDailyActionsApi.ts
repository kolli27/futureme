import { useState, useEffect, useCallback } from 'react'
import { DailyAction, ActionStatus } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface CreateActionInput {
  visionId?: string
  description: string
  estimatedTime: number
  date?: string
  aiGenerated?: boolean
  aiReasoning?: string
  status?: ActionStatus
}

interface UpdateActionInput {
  description?: string
  estimatedTime?: number
  actualTime?: number
  status?: ActionStatus
}

interface ActionTimer {
  id: string
  isRunning: boolean
  startedAt?: Date
  duration?: number
}

export function useDailyActionsApi() {
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0])

  // Fetch actions from API
  const fetchActions = useCallback(async (
    date?: string, 
    startDate?: string, 
    endDate?: string,
    visionId?: string,
    includeTimingSessions: boolean = false
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (visionId) params.append('visionId', visionId)
      if (includeTimingSessions) params.append('includeTimingSessions', 'true')
      
      const response = await fetch(`/api/actions?${params}`)
      const result: ApiResponse<any[]> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Transform database format to application format
        const transformedActions = result.data.map(dbAction => ({
          id: dbAction.id,
          visionId: dbAction.vision_id,
          description: dbAction.description,
          estimatedTime: dbAction.estimated_time_minutes,
          actualTime: dbAction.actual_time_minutes,
          status: dbAction.status,
          date: dbAction.date,
          aiGenerated: dbAction.ai_generated,
          aiReasoning: dbAction.ai_reasoning,
          completed: dbAction.status === 'completed',
          completedAt: dbAction.completed_at,
          timingSessions: dbAction.timingSessions || []
        }))
        
        setDailyActions(transformedActions)
      } else {
        throw new Error(result.error || 'Failed to fetch actions')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actions'
      setError(errorMessage)
      console.error('Fetch actions error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new action
  const createAction = useCallback(async (input: CreateActionInput): Promise<DailyAction | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Transform database format to application format
        const newAction: DailyAction = {
          id: result.data.id,
          visionId: result.data.vision_id,
          description: result.data.description,
          estimatedTime: result.data.estimated_time_minutes,
          actualTime: result.data.actual_time_minutes,
          status: result.data.status,
          date: result.data.date,
          aiGenerated: result.data.ai_generated,
          aiReasoning: result.data.ai_reasoning,
          completed: result.data.status === 'completed',
          completedAt: result.data.completed_at
        }
        
        // Add to local state
        setDailyActions(prev => [...prev, newAction])
        
        return newAction
      } else {
        throw new Error(result.error || 'Failed to create action')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create action'
      setError(errorMessage)
      console.error('Create action error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create multiple actions (batch)
  const createBatchActions = useCallback(async (actions: CreateActionInput[]): Promise<DailyAction[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions }),
      })
      
      const result: ApiResponse<any[]> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Transform database format to application format
        const newActions = result.data.map(dbAction => ({
          id: dbAction.id,
          visionId: dbAction.vision_id,
          description: dbAction.description,
          estimatedTime: dbAction.estimated_time_minutes,
          actualTime: dbAction.actual_time_minutes,
          status: dbAction.status,
          date: dbAction.date,
          aiGenerated: dbAction.ai_generated,
          aiReasoning: dbAction.ai_reasoning,
          completed: dbAction.status === 'completed',
          completedAt: dbAction.completed_at
        }))
        
        // Add to local state
        setDailyActions(prev => [...prev, ...newActions])
        
        return newActions
      } else {
        throw new Error(result.error || 'Failed to create actions')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create actions'
      setError(errorMessage)
      console.error('Create batch actions error:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update action
  const updateAction = useCallback(async (id: string, input: UpdateActionInput): Promise<DailyAction | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Transform database format to application format
        const updatedAction: DailyAction = {
          id: result.data.id,
          visionId: result.data.vision_id,
          description: result.data.description,
          estimatedTime: result.data.estimated_time_minutes,
          actualTime: result.data.actual_time_minutes,
          status: result.data.status,
          date: result.data.date,
          aiGenerated: result.data.ai_generated,
          aiReasoning: result.data.ai_reasoning,
          completed: result.data.status === 'completed',
          completedAt: result.data.completed_at
        }
        
        // Update local state
        setDailyActions(prev => prev.map(action => 
          action.id === id ? updatedAction : action
        ))
        
        return updatedAction
      } else {
        throw new Error(result.error || 'Failed to update action')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update action'
      setError(errorMessage)
      console.error('Update action error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Complete action
  const completeAction = useCallback(async (id: string, actualTimeMinutes?: number): Promise<DailyAction | null> => {
    try {
      const response = await fetch(`/api/actions/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actualTimeMinutes }),
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Update local state
        const updatedAction: DailyAction = {
          id: result.data.id,
          visionId: result.data.vision_id,
          description: result.data.description,
          estimatedTime: result.data.estimated_time_minutes,
          actualTime: result.data.actual_time_minutes,
          status: result.data.status,
          date: result.data.date,
          aiGenerated: result.data.ai_generated,
          aiReasoning: result.data.ai_reasoning,
          completed: result.data.status === 'completed',
          completedAt: result.data.completed_at
        }
        
        setDailyActions(prev => prev.map(action => 
          action.id === id ? updatedAction : action
        ))
        
        return updatedAction
      } else {
        throw new Error(result.error || 'Failed to complete action')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete action'
      setError(errorMessage)
      console.error('Complete action error:', err)
      return null
    }
  }, [])

  // Toggle action completion
  const toggleActionComplete = useCallback(async (id: string): Promise<void> => {
    const action = dailyActions.find(a => a.id === id)
    if (!action) return
    
    const newStatus: ActionStatus = action.completed ? 'pending' : 'completed'
    await updateAction(id, { status: newStatus })
  }, [dailyActions, updateAction])

  // Start timer
  const startTimer = useCallback(async (id: string): Promise<ActionTimer | null> => {
    try {
      const response = await fetch(`/api/actions/${id}/timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        return {
          id: result.data.id,
          isRunning: result.data.is_active,
          startedAt: new Date(result.data.started_at),
          duration: result.data.duration_seconds
        }
      } else {
        throw new Error(result.error || 'Failed to start timer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start timer'
      setError(errorMessage)
      console.error('Start timer error:', err)
      return null
    }
  }, [])

  // Stop timer
  const stopTimer = useCallback(async (id: string): Promise<ActionTimer | null> => {
    try {
      const response = await fetch(`/api/actions/${id}/timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        return {
          id: result.data.id,
          isRunning: result.data.is_active,
          startedAt: result.data.started_at ? new Date(result.data.started_at) : undefined,
          duration: result.data.duration_seconds
        }
      } else {
        throw new Error(result.error || 'Failed to stop timer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop timer'
      setError(errorMessage)
      console.error('Stop timer error:', err)
      return null
    }
  }, [])

  // Delete action
  const deleteAction = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: 'DELETE',
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success) {
        // Remove from local state
        setDailyActions(prev => prev.filter(action => action.id !== id))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete action')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete action'
      setError(errorMessage)
      console.error('Delete action error:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Computed properties
  const completedActions = dailyActions.filter(action => action.completed)
  const totalActions = dailyActions.length
  const completionRate = totalActions > 0 ? (completedActions.length / totalActions) * 100 : 0
  const allActionsComplete = totalActions > 0 && completedActions.length === totalActions

  // Load today's actions on mount
  useEffect(() => {
    fetchActions(currentDate, undefined, undefined, undefined, true)
  }, [fetchActions, currentDate])

  return {
    // State
    dailyActions,
    isLoading,
    error,
    currentDate,
    
    // Actions
    fetchActions,
    createAction,
    createBatchActions,
    updateAction,
    completeAction,
    toggleActionComplete,
    deleteAction,
    
    // Timer actions
    startTimer,
    stopTimer,
    
    // Computed
    completedActions,
    totalActions,
    completionRate,
    allActionsComplete,
    
    // Helpers
    getAction: (id: string) => dailyActions.find(action => action.id === id),
    getActionsByVision: (visionId: string) => dailyActions.filter(action => action.visionId === visionId),
    getActionsByStatus: (status: ActionStatus) => dailyActions.filter(action => action.status === status)
  }
}