/**
 * Database Types and Interfaces
 * 
 * TypeScript types that match the PostgreSQL schema exactly.
 * These types ensure type safety across the application.
 */

// Enum types matching PostgreSQL enums
export type UserRole = 'user' | 'admin' | 'enterprise_admin'
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid'
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'
export type VisionCategory = 'health' | 'career' | 'relationships' | 'personal-growth'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type TimeComplexity = 'low' | 'medium' | 'high'
export type NotificationType = 'daily_reminder' | 'achievement' | 'streak_milestone' | 'team_update'
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export_data' | 'delete_account'

// Database table interfaces
export interface DbUser {
  id: string
  email: string
  email_verified_at?: Date
  password_hash?: string
  name: string
  display_name?: string
  avatar_url?: string
  timezone: string
  locale: string
  role: UserRole
  is_active: boolean
  last_login?: Date
  onboarding_completed: boolean
  trial_ends_at?: Date
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface DbUserOAuthProvider {
  id: string
  user_id: string
  provider: string
  provider_user_id: string
  provider_email?: string
  access_token?: string
  refresh_token?: string
  expires_at?: Date
  created_at: Date
  updated_at: Date
}

export interface DbOrganization {
  id: string
  name: string
  slug: string
  domain?: string
  logo_url?: string
  subscription_plan: SubscriptionPlan
  subscription_status: SubscriptionStatus
  max_members: number
  settings: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface DbOrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: string
  joined_at: Date
  invited_by?: string
}

export interface DbUserSubscription {
  id: string
  user_id: string
  organization_id?: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start?: Date
  current_period_end?: Date
  cancel_at_period_end: boolean
  canceled_at?: Date
  trial_ends_at?: Date
  created_at: Date
  updated_at: Date
}

export interface DbVision {
  id: string
  user_id: string
  category: VisionCategory
  title?: string
  description: string
  priority: number
  time_allocation_minutes: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface DbVisionAiAnalysis {
  id: string
  vision_id: string
  themes: string[]
  key_goals: string[]
  suggested_actions: string[]
  time_complexity: TimeComplexity
  feasibility_score: number
  improvements: string[]
  analysis_version: string
  created_at: Date
  updated_at: Date
}

export interface DbDailyAction {
  id: string
  user_id: string
  vision_id: string
  description: string
  estimated_time_minutes: number
  actual_time_minutes?: number
  status: ActionStatus
  date: string // Date string in YYYY-MM-DD format
  ai_generated: boolean
  ai_reasoning?: string
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

export interface DbActionTimingSession {
  id: string
  action_id: string
  started_at: Date
  ended_at?: Date
  duration_seconds?: number
  is_active: boolean
  created_at: Date
}

export interface DbTimeBudgetAllocation {
  id: string
  user_id: string
  date: string // Date string in YYYY-MM-DD format
  total_available_minutes: number
  created_at: Date
  updated_at: Date
}

export interface DbVisionTimeAllocation {
  id: string
  budget_allocation_id: string
  vision_id: string
  allocated_minutes: number
}

export interface DbUserProgress {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_days_completed: number
  total_actions_completed: number
  total_time_invested_minutes: number
  last_completion_date?: string // Date string in YYYY-MM-DD format
  streak_updated_at: Date
  created_at: Date
  updated_at: Date
}

export interface DbVictoryPost {
  id: string
  user_id: string
  content: string
  day_number: number
  goal_description?: string
  is_public: boolean
  likes_count: number
  comments_count: number
  created_at: Date
  updated_at: Date
}

export interface DbVictoryPostInteraction {
  id: string
  post_id: string
  user_id: string
  interaction_type: string // 'like' | 'comment'
  comment_text?: string
  created_at: Date
}

export interface DbAchievement {
  id: string
  key: string
  title: string
  description: string
  icon?: string
  background_color: string
  criteria: Record<string, any>
  is_active: boolean
  created_at: Date
}

export interface DbUserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: Date
}

export interface DbUserNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content?: string
  data: Record<string, any>
  is_read: boolean
  sent_at?: Date
  created_at: Date
}

export interface DbUserNotificationPreferences {
  id: string
  user_id: string
  daily_reminders: boolean
  achievement_notifications: boolean
  streak_milestones: boolean
  team_updates: boolean
  email_notifications: boolean
  push_notifications: boolean
  notification_time: string // Time string in HH:MM:SS format
  timezone: string
  created_at: Date
  updated_at: Date
}

export interface DbAnalyticsEvent {
  id: string
  user_id?: string
  session_id?: string
  event_name: string
  event_properties: Record<string, any>
  user_properties: Record<string, any>
  timestamp: Date
}

export interface DbAuditLog {
  id: string
  user_id?: string
  action: AuditAction
  resource_type?: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: Date
}

export interface DbDataExportRequest {
  id: string
  user_id: string
  status: string // 'pending' | 'processing' | 'completed' | 'failed'
  export_url?: string
  requested_at: Date
  completed_at?: Date
  expires_at?: Date
}

export interface DbSchemaMigration {
  version: string
  applied_at: Date
}

// Query result types
export interface QueryResult<T> {
  rows: T[]
  rowCount: number
  command: string
}

// Common query parameters
export interface PaginationParams {
  limit: number
  offset: number
}

export interface SortParams {
  column: string
  direction: 'ASC' | 'DESC'
}

export interface FilterParams {
  [key: string]: any
}

// Join query result types
export interface DbVisionWithAnalysis extends DbVision {
  ai_analysis?: DbVisionAiAnalysis
}

export interface DbDailyActionWithVision extends DbDailyAction {
  vision?: DbVision
}

export interface DbUserWithProgress extends DbUser {
  progress?: DbUserProgress
}

export interface DbVictoryPostWithUser extends DbVictoryPost {
  user_name: string
  user_avatar?: string
}

// API response types
export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy'
  latency: number
  connections: {
    total: number
    idle: number
    waiting: number
  }
  error?: string
}

export interface MigrationStatus {
  current_version: string
  pending_migrations: string[]
  last_migration_date?: Date
}

// Error types
export interface DatabaseError extends Error {
  code?: string
  detail?: string
  hint?: string
  position?: string
  constraint?: string
  table?: string
  schema?: string
}

// Utility types
export type CreateUserInput = Omit<DbUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
export type UpdateUserInput = Partial<Omit<DbUser, 'id' | 'created_at' | 'updated_at'>>

export type CreateVisionInput = Omit<DbVision, 'id' | 'created_at' | 'updated_at'>
export type UpdateVisionInput = Partial<Omit<DbVision, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type CreateDailyActionInput = Omit<DbDailyAction, 'id' | 'created_at' | 'updated_at'>
export type UpdateDailyActionInput = Partial<Omit<DbDailyAction, 'id' | 'created_at' | 'updated_at'>>

// Repository interfaces for consistent API across models
export interface BaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>
  findMany(filters?: FilterParams, pagination?: PaginationParams, sort?: SortParams): Promise<T[]>
  create(input: CreateInput): Promise<T>
  update(id: string, input: UpdateInput): Promise<T | null>
  delete(id: string): Promise<boolean>
  count(filters?: FilterParams): Promise<number>
}

export interface UserRepository extends BaseRepository<DbUser, CreateUserInput, UpdateUserInput> {
  findByEmail(email: string): Promise<DbUser | null>
  findActiveUsers(pagination?: PaginationParams): Promise<DbUser[]>
  softDelete(id: string): Promise<boolean>
}

export interface VisionRepository extends BaseRepository<DbVision, CreateVisionInput, UpdateVisionInput> {
  findByUserId(userId: string): Promise<DbVision[]>
  findByUserIdAndCategory(userId: string, category: VisionCategory): Promise<DbVision[]>
  findWithAnalysis(id: string): Promise<DbVisionWithAnalysis | null>
}

export interface DailyActionRepository extends BaseRepository<DbDailyAction, CreateDailyActionInput, UpdateDailyActionInput> {
  findByUserIdAndDate(userId: string, date: string): Promise<DbDailyAction[]>
  findByVisionId(visionId: string): Promise<DbDailyAction[]>
  findCompletedByUserId(userId: string): Promise<DbDailyAction[]>
}