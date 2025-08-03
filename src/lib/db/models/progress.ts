/**
 * User Progress Database Model
 * Handles streak tracking, completion statistics, and progress analytics
 */

import { Pool } from 'pg'
import { DbUserProgress } from '../types'

export class UserProgressRepository {
  constructor(private db: Pool) {}

  async findByUserId(userId: string): Promise<DbUserProgress | null> {
    const result = await this.db.query(
      'SELECT * FROM user_progress WHERE user_id = $1',
      [userId]
    )
    return result.rows[0] || null
  }

  async createOrUpdate(userId: string, updates: Partial<DbUserProgress>): Promise<DbUserProgress> {
    const existingProgress = await this.findByUserId(userId)
    
    if (existingProgress) {
      return this.update(existingProgress.id, updates)
    } else {
      return this.create({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_days_completed: 0,
        total_actions_completed: 0,
        total_time_invested_minutes: 0,
        streak_updated_at: new Date(),
        ...updates
      } as any)
    }
  }

  async create(input: Omit<DbUserProgress, 'id' | 'created_at' | 'updated_at'>): Promise<DbUserProgress> {
    const result = await this.db.query(
      `INSERT INTO user_progress 
       (user_id, current_streak, longest_streak, total_days_completed, 
        total_actions_completed, total_time_invested_minutes, last_completion_date, streak_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.user_id,
        input.current_streak,
        input.longest_streak,
        input.total_days_completed,
        input.total_actions_completed,
        input.total_time_invested_minutes,
        input.last_completion_date,
        input.streak_updated_at
      ]
    )
    return result.rows[0]
  }

  async update(id: string, updates: Partial<DbUserProgress>): Promise<DbUserProgress> {
    const fields = Object.keys(updates).filter(key => key !== 'id')
    const values = fields.map(field => updates[field as keyof DbUserProgress])
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const result = await this.db.query(
      `UPDATE user_progress 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    )
    return result.rows[0]
  }

  async incrementStreak(userId: string): Promise<DbUserProgress> {
    const progress = await this.findByUserId(userId)
    if (!progress) {
      throw new Error('User progress not found')
    }

    const newStreak = progress.current_streak + 1
    const longestStreak = Math.max(progress.longest_streak, newStreak)

    return this.update(progress.id, {
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_completion_date: new Date().toISOString().split('T')[0],
      streak_updated_at: new Date()
    })
  }

  async resetStreak(userId: string): Promise<DbUserProgress> {
    const progress = await this.findByUserId(userId)
    if (!progress) {
      throw new Error('User progress not found')
    }

    return this.update(progress.id, {
      current_streak: 0,
      streak_updated_at: new Date()
    })
  }
}