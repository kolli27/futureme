/**
 * Database Query Builder Utilities
 * Provides helper functions for building dynamic SQL queries
 */

import { FilterParams, PaginationParams, SortParams } from '../types'

export class QueryBuilder {
  private query: string = ''
  private params: any[] = []
  private paramCount: number = 0

  constructor(baseQuery: string) {
    this.query = baseQuery
  }

  where(conditions: FilterParams): this {
    if (!conditions || Object.keys(conditions).length === 0) {
      return this
    }

    const whereConditions: string[] = []
    
    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        this.paramCount++
        if (Array.isArray(value)) {
          whereConditions.push(`${key} = ANY($${this.paramCount})`)
        } else {
          whereConditions.push(`${key} = $${this.paramCount}`)
        }
        this.params.push(value)
      }
    }

    if (whereConditions.length > 0) {
      this.query += ` WHERE ${whereConditions.join(' AND ')}`
    }

    return this
  }

  orderBy(sort?: SortParams): this {
    if (sort) {
      this.query += ` ORDER BY ${sort.column} ${sort.direction}`
    }
    return this
  }

  limit(pagination?: PaginationParams): this {
    if (pagination) {
      this.paramCount++
      this.query += ` LIMIT $${this.paramCount}`
      this.params.push(pagination.limit)

      if (pagination.offset > 0) {
        this.paramCount++
        this.query += ` OFFSET $${this.paramCount}`
        this.params.push(pagination.offset)
      }
    }
    return this
  }

  build(): { query: string; params: any[] } {
    return {
      query: this.query,
      params: this.params
    }
  }

  static select(table: string, columns: string[] = ['*']): QueryBuilder {
    return new QueryBuilder(`SELECT ${columns.join(', ')} FROM ${table}`)
  }

  static count(table: string): QueryBuilder {
    return new QueryBuilder(`SELECT COUNT(*) as count FROM ${table}`)
  }

  static insert(table: string, data: Record<string, any>): { query: string; params: any[] } {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
    
    return {
      query: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      params: values
    }
  }

  static update(table: string, id: string, data: Record<string, any>): { query: string; params: any[] } {
    const fields = Object.keys(data).filter(key => key !== 'id')
    const values = fields.map(field => data[field])
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    return {
      query: `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      params: [id, ...values]
    }
  }

  static delete(table: string, id: string): { query: string; params: any[] } {
    return {
      query: `DELETE FROM ${table} WHERE id = $1`,
      params: [id]
    }
  }

  static softDelete(table: string, id: string): { query: string; params: any[] } {
    return {
      query: `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      params: [id]
    }
  }
}

export function buildWhereClause(conditions: FilterParams): { clause: string; params: any[]; paramOffset: number } {
  if (!conditions || Object.keys(conditions).length === 0) {
    return { clause: '', params: [], paramOffset: 0 }
  }

  const whereConditions: string[] = []
  const params: any[] = []
  let paramCount = 0

  for (const [key, value] of Object.entries(conditions)) {
    if (value !== undefined && value !== null) {
      paramCount++
      if (Array.isArray(value)) {
        whereConditions.push(`${key} = ANY($${paramCount})`)
      } else if (typeof value === 'string' && value.includes('%')) {
        whereConditions.push(`${key} ILIKE $${paramCount}`)
      } else {
        whereConditions.push(`${key} = $${paramCount}`)
      }
      params.push(value)
    }
  }

  return {
    clause: whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '',
    params,
    paramOffset: paramCount
  }
}

export function buildPaginationClause(pagination?: PaginationParams, paramOffset: number = 0): { clause: string; params: any[] } {
  if (!pagination) {
    return { clause: '', params: [] }
  }

  const params: any[] = []
  let clause = `LIMIT $${paramOffset + 1}`
  params.push(pagination.limit)

  if (pagination.offset > 0) {
    clause += ` OFFSET $${paramOffset + 2}`
    params.push(pagination.offset)
  }

  return { clause, params }
}

export function buildSortClause(sort?: SortParams): string {
  if (!sort) return ''
  return `ORDER BY ${sort.column} ${sort.direction}`
}