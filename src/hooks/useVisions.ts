import { useState, useCallback } from 'react'
import { Vision, VisionCategory } from '@/types'
import { useLocalStorage } from './useLocalStorage'
import { generateVisionId } from '@/utils/idUtils'

interface VisionFormData {
  category: VisionCategory
  description: string
  priority: number
  timeAllocation: number
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
  const [visions, setVisions] = useLocalStorage<Vision[]>('user-visions', [])
  const [isLoading, setIsLoading] = useState(false)

  const createVision = useCallback((data: Omit<VisionFormData, 'priority'>) => {
    const newVision: Vision = {
      id: generateVisionId(data.category),
      category: data.category,
      description: data.description,
      priority: visions.length + 1,
      timeAllocation: data.timeAllocation,
      ...(data.aiAnalysis && { aiAnalysis: data.aiAnalysis })
    }
    
    setVisions(prev => [...prev, newVision])
    return newVision
  }, [visions.length, setVisions])

  const updateVision = useCallback((id: string, updates: Partial<Vision>) => {
    setVisions(prev => prev.map(vision => 
      vision.id === id ? { ...vision, ...updates } : vision
    ))
  }, [setVisions])

  const deleteVision = useCallback((id: string) => {
    setVisions(prev => prev.filter(vision => vision.id !== id))
  }, [setVisions])

  const reorderVisions = useCallback((orderedVisions: Vision[]) => {
    const reorderedVisions = orderedVisions.map((vision, index) => ({
      ...vision,
      priority: index + 1
    }))
    setVisions(reorderedVisions)
  }, [setVisions])

  const clearVisions = useCallback(() => {
    setVisions([])
  }, [setVisions])

  return {
    visions,
    isLoading,
    createVision,
    updateVision,
    deleteVision,
    reorderVisions,
    clearVisions
  }
}