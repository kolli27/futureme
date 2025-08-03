/**
 * Database Validation Utilities
 * Input validation and sanitization for database operations
 */

import { VisionCategory, ActionStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from '../types'

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`${field}: ${message}`)
    this.name = 'ValidationError'
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateVisionCategory(category: string): category is VisionCategory {
  return ['health', 'career', 'relationships', 'personal-growth'].includes(category)
}

export function validateActionStatus(status: string): status is ActionStatus {
  return ['pending', 'in_progress', 'completed', 'skipped'].includes(status)
}

export function validateSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return ['free', 'pro', 'enterprise'].includes(plan)
}

export function validateSubscriptionStatus(status: string): status is SubscriptionStatus {
  return ['trial', 'active', 'past_due', 'canceled', 'unpaid'].includes(status)
}

export function validateUserRole(role: string): role is UserRole {
  return ['user', 'admin', 'enterprise_admin'].includes(role)
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function validateTimeAllocation(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440 // Max 24 hours
}

export function validateDateString(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) return false
  
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateStr)
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength)
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export interface ValidatedUserInput {
  email: string
  name: string
  password_hash?: string
  timezone: string
  locale: string
  role: UserRole
  is_active: boolean
  onboarding_completed: boolean
  email_verified_at?: Date
}

export function validateUserInput(input: any): ValidatedUserInput {
  const errors: string[] = []

  if (!input.email || !validateEmail(input.email)) {
    errors.push('Valid email is required')
  }

  if (!input.name || typeof input.name !== 'string' || input.name.trim().length < 1) {
    errors.push('Name is required')
  }

  if (input.password && typeof input.password === 'string') {
    const passwordValidation = validatePassword(input.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
  }

  if (input.role && !validateUserRole(input.role)) {
    errors.push('Invalid user role')
  }

  if (errors.length > 0) {
    throw new ValidationError('validation', errors.join(', '))
  }

  return {
    email: sanitizeString(input.email.toLowerCase()),
    name: sanitizeString(input.name),
    password_hash: input.password_hash,
    timezone: input.timezone || 'UTC',
    locale: input.locale || 'en',
    role: input.role || 'user',
    is_active: input.is_active !== false,
    onboarding_completed: input.onboarding_completed || false,
    email_verified_at: input.email_verified_at
  }
}

export interface ValidatedVisionInput {
  user_id: string
  category: VisionCategory
  title?: string
  description: string
  priority: number
  time_allocation_minutes: number
  is_active: boolean
}

export function validateVisionInput(input: any): ValidatedVisionInput {
  const errors: string[] = []

  if (!input.user_id || !validateUUID(input.user_id)) {
    errors.push('Valid user ID is required')
  }

  if (!input.category || !validateVisionCategory(input.category)) {
    errors.push('Valid vision category is required')
  }

  if (!input.description || typeof input.description !== 'string' || input.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long')
  }

  if (typeof input.priority !== 'number' || input.priority < 1 || input.priority > 10) {
    errors.push('Priority must be a number between 1 and 10')
  }

  if (!validateTimeAllocation(input.time_allocation_minutes)) {
    errors.push('Time allocation must be a valid number of minutes')
  }

  if (errors.length > 0) {
    throw new ValidationError('validation', errors.join(', '))
  }

  return {
    user_id: input.user_id,
    category: input.category,
    title: input.title ? sanitizeString(input.title, 100) : undefined,
    description: sanitizeString(input.description, 1000),
    priority: input.priority,
    time_allocation_minutes: input.time_allocation_minutes,
    is_active: input.is_active !== false
  }
}