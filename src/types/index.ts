// Core data types based on PRD requirements

export type VisionCategory = 'health' | 'career' | 'relationships' | 'personal-growth'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface User {
  id: string
  name: string
  visions: Vision[]
  currentStreak: number
  totalDays: number
}

export interface Vision {
  id: string
  category: VisionCategory
  title?: string
  description: string
  priority: number
  timeAllocation: number // minutes per day
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  aiAnalysis?: {
    themes: string[]
    keyGoals: string[]
    suggestedActions: string[]
    timeComplexity: 'low' | 'medium' | 'high'
    feasibilityScore: number
    improvements: string[]
  }
}

export interface DailyAction {
  id: string
  visionId?: string
  description: string
  estimatedTime: number
  completed: boolean
  actualTime?: number
  status?: ActionStatus
  date: string
  aiGenerated?: boolean
  aiReasoning?: string
  completedAt?: Date
  timingSessions?: any[]
}


export interface TimeBudgetAllocation {
  date: string
  totalAvailableTime: number
  allocations: { visionId: string; timeMinutes: number }[]
}

export interface VictoryPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  day: number
  goal: string
  likes: number
  comments: number
  timestamp: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  backgroundColor: string
  unlockedAt?: string
}

export interface UserProfile {
  id: string
  name: string
  overallProgress: number
  achievementCount: number
  activeGoalCount: number
  achievements: Achievement[]
  goals: Goal[]
}

export interface Goal {
  id: string
  title: string
  category: VisionCategory | string // Allow custom categories
  description?: string // Short goal description
  vision?: string // 5-year vision for this goal
  status: 'in-progress' | 'completed'
  progress?: number
}

export interface OnboardingGoal {
  id: string
  category: VisionCategory | string
  title: string
  vision: string
}

export type VisionCategory = 'health' | 'career' | 'relationships' | 'personal-growth'

export interface TimerState {
  isRunning: boolean
  remainingTime: number
  totalTime: number
  actionId: string
}