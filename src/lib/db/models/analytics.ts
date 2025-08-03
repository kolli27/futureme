/**
 * Analytics Database Model
 * Handles event tracking, user behavior analytics, and business metrics
 */

import { Pool } from 'pg'
import { DbAnalyticsEvent } from '../types'

export class AnalyticsRepository {
  constructor(private db: Pool) {}

  async trackEvent(
    eventName: string,
    eventProperties: Record<string, any> = {},
    userProperties: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): Promise<DbAnalyticsEvent> {
    const result = await this.db.query(
      `INSERT INTO analytics_events 
       (user_id, session_id, event_name, event_properties, user_properties, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        sessionId,
        eventName,
        JSON.stringify(eventProperties),
        JSON.stringify(userProperties),
        new Date()
      ]
    )
    return result.rows[0]
  }

  async findEventsByUser(userId: string, limit: number = 100): Promise<DbAnalyticsEvent[]> {
    const result = await this.db.query(
      `SELECT * FROM analytics_events 
       WHERE user_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [userId, limit]
    )
    return result.rows
  }

  async findEventsByName(eventName: string, startDate?: Date, endDate?: Date): Promise<DbAnalyticsEvent[]> {
    let query = 'SELECT * FROM analytics_events WHERE event_name = $1'
    const params: any[] = [eventName]

    if (startDate) {
      query += ' AND timestamp >= $2'
      params.push(startDate)
    }

    if (endDate) {
      query += ` AND timestamp <= $${params.length + 1}`
      params.push(endDate)
    }

    query += ' ORDER BY timestamp DESC'

    const result = await this.db.query(query, params)
    return result.rows
  }

  async getDailyActiveUsers(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await this.db.query(
      `SELECT COUNT(DISTINCT user_id) as dau
       FROM analytics_events 
       WHERE timestamp >= $1 AND timestamp <= $2 AND user_id IS NOT NULL`,
      [startOfDay, endOfDay]
    )
    return parseInt(result.rows[0].dau) || 0
  }

  async getEventCounts(startDate: Date, endDate: Date): Promise<Array<{event_name: string, count: number}>> {
    const result = await this.db.query(
      `SELECT event_name, COUNT(*) as count
       FROM analytics_events 
       WHERE timestamp >= $1 AND timestamp <= $2
       GROUP BY event_name
       ORDER BY count DESC`,
      [startDate, endDate]
    )
    return result.rows.map(row => ({
      event_name: row.event_name,
      count: parseInt(row.count)
    }))
  }

  async getRetentionMetrics(cohortStartDate: Date, cohortEndDate: Date): Promise<any> {
    // Simplified retention calculation - can be expanded for more detailed cohort analysis
    const result = await this.db.query(
      `WITH first_visits AS (
         SELECT user_id, MIN(timestamp::date) as first_visit_date
         FROM analytics_events 
         WHERE user_id IS NOT NULL 
           AND timestamp >= $1 AND timestamp <= $2
         GROUP BY user_id
       ),
       returning_users AS (
         SELECT fv.user_id, fv.first_visit_date,
                COUNT(DISTINCT ae.timestamp::date) as days_active
         FROM first_visits fv
         LEFT JOIN analytics_events ae ON fv.user_id = ae.user_id 
           AND ae.timestamp::date > fv.first_visit_date
           AND ae.timestamp::date <= fv.first_visit_date + INTERVAL '30 days'
         GROUP BY fv.user_id, fv.first_visit_date
       )
       SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN days_active >= 1 THEN 1 END) as day_1_retention,
         COUNT(CASE WHEN days_active >= 7 THEN 1 END) as day_7_retention,
         COUNT(CASE WHEN days_active >= 30 THEN 1 END) as day_30_retention
       FROM returning_users`,
      [cohortStartDate, cohortEndDate]
    )
    
    const data = result.rows[0]
    return {
      totalUsers: parseInt(data.total_users),
      day1Retention: data.total_users > 0 ? (parseInt(data.day_1_retention) / parseInt(data.total_users)) * 100 : 0,
      day7Retention: data.total_users > 0 ? (parseInt(data.day_7_retention) / parseInt(data.total_users)) * 100 : 0,
      day30Retention: data.total_users > 0 ? (parseInt(data.day_30_retention) / parseInt(data.total_users)) * 100 : 0
    }
  }

  async cleanupOldEvents(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.db.query(
      'DELETE FROM analytics_events WHERE timestamp < $1',
      [cutoffDate]
    )
    return result.rowCount || 0
  }
}