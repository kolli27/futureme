import { useState, useEffect, useCallback } from 'react'
import { Vision, VisionCategory } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface CreateVisionInput {
  category: VisionCategory
  title?: string
  description: string
  priority?: number
  timeAllocation?: number
}

interface UpdateVisionInput {
  category?: VisionCategory
  title?: string
  description?: string
  priority?: number
  timeAllocation?: number
  isActive?: boolean
}

export function useVisionsApi() {
  const [visions, setVisions] = useState<Vision[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch visions from API
  const fetchVisions = useCallback(async (activeOnly: boolean = true, category?: VisionCategory) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (!activeOnly) params.append('active', 'false')
      if (category) params.append('category', category)
      
      const response = await fetch(`/api/visions?${params}`)
      const result: ApiResponse<Vision[]> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        // Transform database format to application format
        const transformedVisions = result.data.map(dbVision => ({
          id: dbVision.id,
          category: dbVision.category,
          title: dbVision.title || '',
          description: dbVision.description,
          priority: dbVision.priority,
          timeAllocation: dbVision.time_allocation_minutes,
          isActive: dbVision.is_active,
          createdAt: dbVision.created_at,
          updatedAt: dbVision.updated_at
        }))
        
        setVisions(transformedVisions)
      } else {
        throw new Error(result.error || 'Failed to fetch visions')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch visions'
      setError(errorMessage)
      console.error('Fetch visions error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new vision
  const createVision = useCallback(async (input: CreateVisionInput): Promise<Vision | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/visions', {
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
        const newVision: Vision = {
          id: result.data.id,
          category: result.data.category,
          title: result.data.title || '',
          description: result.data.description,
          priority: result.data.priority,
          timeAllocation: result.data.time_allocation_minutes,
          isActive: result.data.is_active,
          createdAt: result.data.created_at,
          updatedAt: result.data.updated_at
        }
        
        // Add to local state
        setVisions(prev => [...prev, newVision])
        
        return newVision
      } else {
        throw new Error(result.error || 'Failed to create vision')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vision'
      setError(errorMessage)
      console.error('Create vision error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update vision
  const updateVision = useCallback(async (id: string, input: UpdateVisionInput): Promise<Vision | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/visions/${id}`, {
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
        const updatedVision: Vision = {
          id: result.data.id,
          category: result.data.category,
          title: result.data.title || '',
          description: result.data.description,
          priority: result.data.priority,
          timeAllocation: result.data.time_allocation_minutes,
          isActive: result.data.is_active,
          createdAt: result.data.created_at,
          updatedAt: result.data.updated_at
        }
        
        // Update local state
        setVisions(prev => prev.map(vision => 
          vision.id === id ? updatedVision : vision
        ))
        
        return updatedVision
      } else {
        throw new Error(result.error || 'Failed to update vision')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vision'
      setError(errorMessage)
      console.error('Update vision error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete vision
  const deleteVision = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/visions/${id}`, {
        method: 'DELETE',
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success) {
        // Remove from local state
        setVisions(prev => prev.filter(vision => vision.id !== id))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete vision')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vision'
      setError(errorMessage)
      console.error('Delete vision error:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get vision by ID
  const getVision = useCallback((id: string): Vision | undefined => {
    return visions.find(vision => vision.id === id)
  }, [visions])

  // Get visions by category
  const getVisionsByCategory = useCallback((category: VisionCategory): Vision[] => {
    return visions.filter(vision => vision.category === category && vision.isActive)
  }, [visions])

  // Get active visions
  const getActiveVisions = useCallback((): Vision[] => {
    return visions.filter(vision => vision.isActive)
  }, [visions])

  // Load visions on mount
  useEffect(() => {
    fetchVisions()
  }, [fetchVisions])

  return {
    // State
    visions,
    isLoading,
    error,
    
    // Actions
    fetchVisions,
    createVision,
    updateVision,
    deleteVision,
    
    // Getters
    getVision,
    getVisionsByCategory,
    getActiveVisions,
    
    // Computed
    activeVisions: getActiveVisions(),
    visionCount: visions.length,
    activeVisionCount: getActiveVisions().length
  }
}