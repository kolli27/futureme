/**
 * Database Audit Trail Utilities
 * Handles audit logging for compliance and security monitoring
 */

import { Pool } from 'pg'
import { DbAuditLog, AuditAction } from '../types'

export class AuditLogger {
  constructor(private db: Pool) {}

  async log(
    action: AuditAction,
    userId?: string,
    resourceType?: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<DbAuditLog> {
    const result = await this.db.query(
      `INSERT INTO audit_log 
       (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        action,
        resourceType,
        resourceId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
        new Date()
      ]
    )
    return result.rows[0]
  }

  async logUserAction(
    userId: string,
    action: AuditAction,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
  ): Promise<DbAuditLog> {
    return this.log(
      action,
      userId,
      resourceType,
      resourceId,
      undefined,
      details,
      request?.ip,
      request?.userAgent
    )
  }

  async logDataChange(
    userId: string,
    action: 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
  ): Promise<DbAuditLog> {
    return this.log(
      action,
      userId,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      request?.ip,
      request?.userAgent
    )
  }

  async logSecurityEvent(
    action: AuditAction,
    userId?: string,
    details?: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
  ): Promise<DbAuditLog> {
    return this.log(
      action,
      userId,
      'security',
      undefined,
      undefined,
      details,
      request?.ip,
      request?.userAgent
    )
  }

  async getAuditTrail(
    userId?: string,
    resourceType?: string,
    resourceId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<DbAuditLog[]> {
    let query = 'SELECT * FROM audit_log WHERE 1=1'
    const params: any[] = []
    let paramCount = 0

    if (userId) {
      paramCount++
      query += ` AND user_id = $${paramCount}`
      params.push(userId)
    }

    if (resourceType) {
      paramCount++
      query += ` AND resource_type = $${paramCount}`
      params.push(resourceType)
    }

    if (resourceId) {
      paramCount++
      query += ` AND resource_id = $${paramCount}`
      params.push(resourceId)
    }

    if (startDate) {
      paramCount++
      query += ` AND timestamp >= $${paramCount}`
      params.push(startDate)
    }

    if (endDate) {
      paramCount++
      query += ` AND timestamp <= $${paramCount}`
      params.push(endDate)
    }

    paramCount++
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount}`
    params.push(limit)

    const result = await this.db.query(query, params)
    return result.rows
  }

  async getSecurityEvents(
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<DbAuditLog[]> {
    return this.getAuditTrail(undefined, 'security', undefined, startDate, endDate, limit)
  }

  async cleanupOldAuditLogs(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.db.query(
      'DELETE FROM audit_log WHERE timestamp < $1',
      [cutoffDate]
    )
    return result.rowCount || 0
  }
}

// Audit middleware function for Express routes
export function createAuditMiddleware(auditLogger: AuditLogger) {
  return (req: any, res: any, next: any) => {
    // Store original res.json to intercept responses
    const originalJson = res.json

    res.json = function(data: any) {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id
        const method = req.method
        const path = req.path
        
        let action: AuditAction
        if (method === 'POST') action = 'create'
        else if (method === 'PUT' || method === 'PATCH') action = 'update'
        else if (method === 'DELETE') action = 'delete'
        else return originalJson.call(this, data)

        // Extract resource info from path
        const pathParts = path.split('/')
        const resourceType = pathParts[2] // /api/[resource]/...
        const resourceId = pathParts[3]

        auditLogger.logUserAction(
          userId,
          action,
          resourceType,
          resourceId,
          { method, path, statusCode: res.statusCode },
          { ip: req.ip, userAgent: req.get('User-Agent') }
        ).catch(error => {
          console.error('Audit logging failed:', error)
        })
      }

      return originalJson.call(this, data)
    }

    next()
  }
}

// Helper function to create audit context from request
export function createAuditContext(req: any): { ip?: string; userAgent?: string } {
  return {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent')
  }
}