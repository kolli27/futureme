import { Vision, VisionCategory } from '@/types'

export function validateVision(vision: Partial<Vision>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!vision.description || vision.description.trim().length === 0) {
    errors.push('Vision description is required')
  }

  if (vision.description && vision.description.length < 10) {
    errors.push('Vision description must be at least 10 characters')
  }

  if (!vision.category) {
    errors.push('Vision category is required')
  }

  if (vision.category && !isValidCategory(vision.category)) {
    errors.push('Invalid vision category')
  }

  if (vision.timeAllocation !== undefined && vision.timeAllocation < 5) {
    errors.push('Time allocation must be at least 5 minutes')
  }

  if (vision.timeAllocation !== undefined && vision.timeAllocation > 480) {
    errors.push('Time allocation cannot exceed 8 hours (480 minutes)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function isValidCategory(category: string): category is VisionCategory {
  return ['health', 'career', 'relationships', 'personal-growth'].includes(category)
}

export function validateTimeBudget(totalTime: number, allocations: number[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation, 0)

  if (totalTime < 30) {
    errors.push('Total available time must be at least 30 minutes')
  }

  if (totalTime > 480) {
    errors.push('Total available time cannot exceed 8 hours')
  }

  if (totalAllocated !== totalTime) {
    errors.push('All available time must be allocated')
  }

  if (allocations.some(allocation => allocation < 0)) {
    errors.push('Time allocations cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}