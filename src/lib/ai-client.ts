import { Vision, DailyAction } from '@/types'

// Client-side AI service that makes secure API calls to server-side AI endpoints
// This replaces direct OpenAI calls and ensures API keys are never exposed client-side

interface AIResponse<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

class AIServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'AIServiceError'
  }
}

// Helper function to make authenticated API requests
async function makeAIRequest<T>(endpoint: string, body: object): Promise<AIResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new AIServiceError(
        result.error || `API request failed with status ${response.status}`,
        response.status
      )
    }

    return result
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error
    }
    
    console.error(`AI API request failed for ${endpoint}:`, error)
    throw new AIServiceError('Network error - please check your connection')
  }
}

// Client-side AI Service for Daily Actions Generation
export async function generateDailyActions(
  visions: Vision[], 
  userBehaviorData?: {
    completionTimes: number[]
    preferredActionTypes: string[]
    successfulActions: string[]
  }
): Promise<AIResponse<DailyAction[]>> {
  try {
    if (!visions || visions.length === 0) {
      return {
        success: false,
        error: 'No visions provided for action generation'
      }
    }

    const response = await makeAIRequest<DailyAction[]>('/api/ai/generate-actions', {
      visions,
      userBehaviorData
    })

    return response

  } catch (error) {
    console.error('AI Actions Generation Error:', error)
    
    return {
      success: false,
      error: error instanceof AIServiceError ? error.message : 'Failed to generate actions',
      data: [] // Return empty array as fallback
    }
  }
}

// Client-side AI Service for Insights & Recommendations
export async function generatePersonalizedInsights(
  userStats: {
    completionRate: number
    averageCompletionTime: number
    streakCount: number
    preferredTimes: number[]
    visionProgress: { [visionId: string]: number }
  }
): Promise<AIResponse<{
  recommendations: Array<{
    title: string
    description: string
    confidence: number
    type: 'timing' | 'duration' | 'frequency' | 'strategy'
  }>
  insights: Array<{
    metric: string
    value: string
    trend: 'up' | 'down' | 'stable'
    interpretation: string
  }>
}>> {
  try {
    if (!userStats || typeof userStats !== 'object') {
      return {
        success: false,
        error: 'Invalid user stats provided for insights generation'
      }
    }

    const response = await makeAIRequest('/api/ai/insights', {
      userStats
    })

    return response

  } catch (error) {
    console.error('AI Insights Generation Error:', error)
    
    return {
      success: false,
      error: error instanceof AIServiceError ? error.message : 'Failed to generate insights',
      data: {
        recommendations: [],
        insights: []
      }
    }
  }
}

// Client-side AI Service for Vision Processing & Understanding
export async function analyzeVisionDescription(
  visionDescription: string,
  category: string
): Promise<AIResponse<{
  themes: string[]
  keyGoals: string[]
  suggestedActions: string[]
  timeComplexity: 'low' | 'medium' | 'high'
  feasibilityScore: number
  improvements: string[]
}>> {
  try {
    if (!visionDescription || !category) {
      return {
        success: false,
        error: 'Vision description and category are required'
      }
    }

    if (visionDescription.length < 10) {
      return {
        success: false,
        error: 'Vision description is too short - please provide more details'
      }
    }

    if (visionDescription.length > 2000) {
      return {
        success: false,
        error: 'Vision description is too long - please keep it under 2000 characters'
      }
    }

    const response = await makeAIRequest('/api/ai/analyze-vision', {
      visionDescription: visionDescription.trim(),
      category: category.trim()
    })

    return response

  } catch (error) {
    console.error('AI Vision Analysis Error:', error)
    
    return {
      success: false,
      error: error instanceof AIServiceError ? error.message : 'Failed to analyze vision',
      data: {
        themes: [],
        keyGoals: [],
        suggestedActions: [],
        timeComplexity: 'medium' as const,
        feasibilityScore: 0.8,
        improvements: []
      }
    }
  }
}

// Export the error class for external error handling
export { AIServiceError }

// Export type definitions
export type { AIResponse }