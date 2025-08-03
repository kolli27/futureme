/**
 * Vision Database Model
 * 
 * Handles all vision-related database operations including CRUD,
 * vision management, and AI analysis integration.
 */

import { query, transaction } from '../config'
import { 
  DbVision, 
  DbVisionAiAnalysis, 
  VisionCategory,
  TimeComplexity
} from '../types'

interface CreateVisionInput {
  user_id: string
  category: VisionCategory
  title?: string
  description: string
  priority: number
  time_allocation_minutes: number
  is_active?: boolean
}

interface UpdateVisionInput {
  category?: VisionCategory
  title?: string
  description?: string
  priority?: number
  time_allocation_minutes?: number
  is_active?: boolean
}

interface VisionAiAnalysisInput {
  vision_id: string
  themes: string[]
  key_goals: string[]
  suggested_actions: string[]
  time_complexity: TimeComplexity
  feasibility_score: number
  improvements: string[]
  analysis_version?: string
}

class VisionModel {
  /**
   * Find vision by ID
   */
  async findById(id: string): Promise<DbVision | null> {
    const result = await query<DbVision>(
      'SELECT * FROM visions WHERE id = $1',
      [id]
    )
    return result[0] || null
  }

  /**
   * Find vision by ID with user validation
   */
  async findByIdForUser(id: string, userId: string): Promise<DbVision | null> {
    const result = await query<DbVision>(
      'SELECT * FROM visions WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return result[0] || null
  }

  /**
   * Find all visions for a user
   */
  async findByUserId(userId: string, activeOnly: boolean = true): Promise<DbVision[]> {
    let sql = 'SELECT * FROM visions WHERE user_id = $1'
    const params = [userId]
    
    if (activeOnly) {
      sql += ' AND is_active = true'
    }
    
    sql += ' ORDER BY priority DESC, created_at ASC'
    
    return await query<DbVision>(sql, params)
  }

  /**
   * Find visions by category for a user
   */
  async findByCategory(userId: string, category: VisionCategory): Promise<DbVision[]> {
    const result = await query<DbVision>(
      'SELECT * FROM visions WHERE user_id = $1 AND category = $2 AND is_active = true ORDER BY priority DESC',
      [userId, category]
    )
    return result
  }

  /**
   * Create a new vision
   */
  async create(input: CreateVisionInput): Promise<DbVision> {
    const result = await query<DbVision>(
      `INSERT INTO visions (
        user_id, category, title, description, priority, 
        time_allocation_minutes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        input.user_id,
        input.category,
        input.title || null,
        input.description,
        input.priority,
        input.time_allocation_minutes,
        input.is_active !== undefined ? input.is_active : true
      ]
    )

    return result[0]
  }

  /**
   * Update vision
   */
  async update(id: string, userId: string, input: UpdateVisionInput): Promise<DbVision | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 0

    // Build dynamic update query
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${++paramCount}`)
        params.push(value)
      }
    })

    if (updateFields.length === 0) {
      return this.findByIdForUser(id, userId)
    }

    params.push(id, userId)
    const result = await query<DbVision>(
      `UPDATE visions 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${++paramCount} AND user_id = $${++paramCount}
       RETURNING *`,
      params
    )

    return result[0] || null
  }

  /**
   * Delete vision (hard delete)
   */
  async delete(id: string, userId: string): Promise<boolean> {
    return transaction(async (client) => {
      // Delete AI analysis first
      await client.query('DELETE FROM vision_ai_analysis WHERE vision_id = $1', [id])
      
      // Delete vision time allocations
      await client.query(
        'DELETE FROM vision_time_allocations WHERE vision_id = $1', 
        [id]
      )
      
      // Update daily actions to reference null vision (preserve action history)
      await client.query(
        'UPDATE daily_actions SET vision_id = NULL WHERE vision_id = $1 AND user_id = $2',
        [id, userId]
      )
      
      // Delete the vision
      const result = await client.query(
        'DELETE FROM visions WHERE id = $1 AND user_id = $2',
        [id, userId]
      )
      
      return (result.rowCount || 0) > 0
    })
  }

  /**
   * Soft deactivate vision
   */
  async deactivate(id: string, userId: string): Promise<DbVision | null> {
    return this.update(id, userId, { is_active: false })
  }

  /**
   * Reactivate vision
   */
  async activate(id: string, userId: string): Promise<DbVision | null> {
    return this.update(id, userId, { is_active: true })
  }

  /**
   * Count active visions for a user
   */
  async countActiveForUser(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM visions WHERE user_id = $1 AND is_active = true',
      [userId]
    )
    return parseInt(result[0].count)
  }

  /**
   * Update vision priority
   */
  async updatePriority(id: string, userId: string, priority: number): Promise<DbVision | null> {
    return this.update(id, userId, { priority })
  }

  /**
   * Find vision with AI analysis
   */
  async findWithAiAnalysis(id: string, userId: string): Promise<{
    vision: DbVision
    aiAnalysis: DbVisionAiAnalysis | null
  } | null> {
    const result = await query<any>(
      `SELECT 
        v.*,
        a.id as analysis_id, a.themes, a.key_goals, a.suggested_actions,
        a.time_complexity, a.feasibility_score, a.improvements, 
        a.analysis_version, a.created_at as analysis_created_at
       FROM visions v
       LEFT JOIN vision_ai_analysis a ON v.id = a.vision_id
       WHERE v.id = $1 AND v.user_id = $2`,
      [id, userId]
    )

    if (!result[0]) return null

    const row = result[0]
    return {
      vision: {
        id: row.id,
        user_id: row.user_id,
        category: row.category,
        title: row.title,
        description: row.description,
        priority: row.priority,
        time_allocation_minutes: row.time_allocation_minutes,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      },
      aiAnalysis: row.analysis_id ? {
        id: row.analysis_id,
        vision_id: row.id,
        themes: row.themes,
        key_goals: row.key_goals,
        suggested_actions: row.suggested_actions,
        time_complexity: row.time_complexity,
        feasibility_score: row.feasibility_score,
        improvements: row.improvements,
        analysis_version: row.analysis_version,
        created_at: row.analysis_created_at,
        updated_at: row.updated_at
      } : null
    }
  }

  /**
   * Create or update AI analysis for a vision
   */
  async upsertAiAnalysis(input: VisionAiAnalysisInput): Promise<DbVisionAiAnalysis> {
    const result = await query<DbVisionAiAnalysis>(
      `INSERT INTO vision_ai_analysis (
        vision_id, themes, key_goals, suggested_actions, 
        time_complexity, feasibility_score, improvements, analysis_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (vision_id) DO UPDATE SET
        themes = EXCLUDED.themes,
        key_goals = EXCLUDED.key_goals,
        suggested_actions = EXCLUDED.suggested_actions,
        time_complexity = EXCLUDED.time_complexity,
        feasibility_score = EXCLUDED.feasibility_score,
        improvements = EXCLUDED.improvements,
        analysis_version = EXCLUDED.analysis_version,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        input.vision_id,
        input.themes,
        input.key_goals,
        input.suggested_actions,
        input.time_complexity,
        input.feasibility_score,
        input.improvements,
        input.analysis_version || '1.0'
      ]
    )

    return result[0]
  }

  /**
   * Find AI analysis for a vision
   */
  async findAiAnalysis(visionId: string, userId: string): Promise<DbVisionAiAnalysis | null> {
    const result = await query<DbVisionAiAnalysis>(
      `SELECT a.* FROM vision_ai_analysis a
       JOIN visions v ON a.vision_id = v.id
       WHERE a.vision_id = $1 AND v.user_id = $2`,
      [visionId, userId]
    )
    return result[0] || null
  }

  /**
   * Get vision statistics for a user
   */
  async getUserVisionStats(userId: string): Promise<{
    totalVisions: number
    activeVisions: number
    completedVisions: number
    totalTimeAllocated: number
    averagePriority: number
    categoryBreakdown: Record<VisionCategory, number>
  }> {
    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total_visions,
        COUNT(*) FILTER (WHERE is_active = true) as active_visions,
        COUNT(*) FILTER (WHERE is_active = false) as completed_visions,
        COALESCE(SUM(time_allocation_minutes), 0) as total_time_allocated,
        COALESCE(AVG(priority), 0) as average_priority,
        category,
        COUNT(*) as category_count
       FROM visions 
       WHERE user_id = $1 
       GROUP BY ROLLUP(category)`,
      [userId]
    )

    const categoryBreakdown: Record<VisionCategory, number> = {
      'health': 0,
      'career': 0,
      'relationships': 0,
      'personal-growth': 0
    }

    let totalVisions = 0
    let activeVisions = 0
    let completedVisions = 0
    let totalTimeAllocated = 0
    let averagePriority = 0

    stats.forEach(row => {
      if (row.category === null) {
        // This is the ROLLUP total row
        totalVisions = parseInt(row.total_visions)
        activeVisions = parseInt(row.active_visions)
        completedVisions = parseInt(row.completed_visions)
        totalTimeAllocated = parseInt(row.total_time_allocated)
        averagePriority = parseFloat(row.average_priority)
      } else {
        // Category-specific row
        categoryBreakdown[row.category as VisionCategory] = parseInt(row.category_count)
      }
    })

    return {
      totalVisions,
      activeVisions,
      completedVisions,
      totalTimeAllocated,
      averagePriority,
      categoryBreakdown
    }
  }
}

// Export singleton instance
export const visionModel = new VisionModel()
export default visionModel

// Export types
export type { CreateVisionInput, UpdateVisionInput, VisionAiAnalysisInput }