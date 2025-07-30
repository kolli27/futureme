import React, { useCallback } from 'react'
import { Vision, VisionCategory } from '@/types'
import { useVisionsApi } from './useVisionsApi'
import { useSubscription } from './useSubscription'

interface VisionFormData {
  category: VisionCategory
  description: string
  priority?: number
  timeAllocation?: number
  title?: string
  aiAnalysis?: {
    themes: string[]
    keyGoals: string[]
    suggestedActions: string[]
    timeComplexity: 'low' | 'medium' | 'high'
    feasibilityScore: number
    improvements: string[]
  }
}

export function useVisions() {
  const {
    visions,
    isLoading,
    error,
    createVision: apiCreateVision,
    updateVision: apiUpdateVision,
    deleteVision: apiDeleteVision,
    getVision,
    getVisionsByCategory,
    activeVisions,
    visionCount,
    activeVisionCount
  } = useVisionsApi()
  
  const { canCreateVision, setUsage } = useSubscription()

  // Update usage when visions change
  React.useEffect(() => {
    setUsage(prev => ({ ...prev, visionCount: activeVisionCount }))
  }, [activeVisionCount, setUsage])

  // Create vision with backward compatibility and subscription check
  const createVision = useCallback(async (data: Omit<VisionFormData, 'priority'>) => {
    // Check if user can create vision based on subscription
    const permissionCheck = canCreateVision
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Cannot create vision')
    }

    const result = await apiCreateVision({
      category: data.category,
      description: data.description,
      title: data.title || '',
      priority: visions.length + 1,
      timeAllocation: data.timeAllocation || 30
    })
    return result
  }, [apiCreateVision, visions.length, canCreateVision])

  // Update vision with backward compatibility
  const updateVision = useCallback(async (id: string, updates: Partial<Vision>) => {
    const result = await apiUpdateVision(id, {
      category: updates.category,
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      timeAllocation: updates.timeAllocation,
      isActive: updates.isActive
    })
    return result
  }, [apiUpdateVision])

  // Delete vision with backward compatibility
  const deleteVision = useCallback(async (id: string) => {
    return await apiDeleteVision(id)
  }, [apiDeleteVision])

  // Reorder visions (updates priorities)
  const reorderVisions = useCallback(async (orderedVisions: Vision[]) => {
    const updates = orderedVisions.map((vision, index) => ({
      id: vision.id,
      priority: index + 1
    }))

    // Update all visions with new priorities
    for (const update of updates) {
      await apiUpdateVision(update.id, { priority: update.priority })
    }
  }, [apiUpdateVision])

  // Get vision by ID with fallback
  const getVisionById = useCallback((id: string): Vision | undefined => {
    return getVision(id)
  }, [getVision])

  // Get visions by category with fallback
  const getVisionsByVisionCategory = useCallback((category: VisionCategory): Vision[] => {
    return getVisionsByCategory(category)
  }, [getVisionsByCategory])

  // Clear all visions (mainly for testing)
  const clearVisions = useCallback(async () => {
    // Delete all visions
    for (const vision of visions) {
      await apiDeleteVision(vision.id)
    }
  }, [visions, apiDeleteVision])

  return {
    // Core state
    visions,
    isLoading,
    error,
    
    // CRUD operations
    createVision,
    updateVision,
    deleteVision,
    reorderVisions,
    clearVisions,
    
    // Getters
    getVisionById,
    getVisionsByCategory: getVisionsByVisionCategory,
    
    // Computed values
    activeVisions,
    visionCount,
    activeVisionCount,
    
    // Additional computed
    healthVisions: getVisionsByCategory('health'),
    careerVisions: getVisionsByCategory('career'),
    relationshipVisions: getVisionsByCategory('relationships'),
    personalGrowthVisions: getVisionsByCategory('personal-growth'),
    
    // Subscription-aware permissions
    canCreateVision,
    
    // Legacy compatibility
    hasVisions: visions.length > 0,
    isEmpty: visions.length === 0
  }
}