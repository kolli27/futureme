/**
 * Authentication Token Management
 * 
 * Handles email verification tokens, password reset tokens,
 * and other authentication-related tokens with expiration.
 */

import { query, transaction } from '../db/config'
import { generateSecureToken } from './password'
import { PoolClient } from 'pg'

export interface AuthToken {
  id: string
  user_id: string
  token: string
  type: 'email_verification' | 'password_reset' | 'login_verification'
  expires_at: Date
  used_at?: Date
  created_at: Date
}

export interface CreateTokenInput {
  user_id: string
  type: 'email_verification' | 'password_reset' | 'login_verification'
  expires_in_minutes?: number
}

class TokenService {
  /**
   * Create a new authentication token
   */
  async createToken(input: CreateTokenInput): Promise<AuthToken> {
    const token = generateSecureToken(64) // Long, secure token
    const expiresInMinutes = input.expires_in_minutes || this.getDefaultExpirationMinutes(input.type)
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    const result = await query<AuthToken>(
      `INSERT INTO auth_tokens (user_id, token, type, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.user_id, token, input.type, expiresAt]
    )

    return result[0]
  }

  /**
   * Find a valid token by token string
   */
  async findValidToken(token: string, type?: string): Promise<AuthToken | null> {
    let sql = `
      SELECT * FROM auth_tokens 
      WHERE token = $1 
        AND expires_at > NOW() 
        AND used_at IS NULL
    `
    const params: any[] = [token]

    if (type) {
      sql += ' AND type = $2'
      params.push(type)
    }

    const result = await query<AuthToken>(sql, params)
    return result[0] || null
  }

  /**
   * Mark a token as used
   */
  async useToken(token: string): Promise<AuthToken | null> {
    const result = await query<AuthToken>(
      `UPDATE auth_tokens 
       SET used_at = NOW()
       WHERE token = $1 
         AND expires_at > NOW() 
         AND used_at IS NULL
       RETURNING *`,
      [token]
    )

    return result[0] || null
  }

  /**
   * Invalidate all tokens for a user of a specific type
   */
  async invalidateUserTokens(userId: string, type?: string): Promise<number> {
    let sql = 'UPDATE auth_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL'
    const params: any[] = [userId]

    if (type) {
      sql += ' AND type = $2'
      params.push(type)
    }

    const result = await query(sql, params)
    return result.length
  }

  /**
   * Clean up expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await query(
      'DELETE FROM auth_tokens WHERE expires_at < NOW() - INTERVAL \'7 days\'',
      []
    )
    return result.length
  }

  /**
   * Get token counts for monitoring
   */
  async getTokenStats(): Promise<{
    total: number
    by_type: Record<string, number>
    expired: number
    used: number
  }> {
    const [totalResult, byTypeResult, expiredResult, usedResult] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM auth_tokens', []),
      query<{ type: string; count: string }>(
        'SELECT type, COUNT(*) as count FROM auth_tokens GROUP BY type',
        []
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM auth_tokens WHERE expires_at < NOW()',
        []
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM auth_tokens WHERE used_at IS NOT NULL',
        []
      )
    ])

    const byType: Record<string, number> = {}
    byTypeResult.forEach(row => {
      byType[row.type] = parseInt(row.count)
    })

    return {
      total: parseInt(totalResult[0].count),
      by_type: byType,
      expired: parseInt(expiredResult[0].count),
      used: parseInt(usedResult[0].count)
    }
  }

  /**
   * Verify token and get associated user
   */
  async verifyTokenAndGetUser(token: string, type: string): Promise<{
    token: AuthToken
    user: any
  } | null> {
    const result = await query<any>(
      `SELECT 
         t.*,
         u.id as user_id,
         u.email,
         u.name,
         u.email_verified_at,
         u.is_active
       FROM auth_tokens t
       JOIN users u ON t.user_id = u.id
       WHERE t.token = $1 
         AND t.type = $2
         AND t.expires_at > NOW()
         AND t.used_at IS NULL
         AND u.deleted_at IS NULL`,
      [token, type]
    )

    if (!result[0]) return null

    const row = result[0]
    return {
      token: {
        id: row.id,
        user_id: row.user_id,
        token: row.token,
        type: row.type,
        expires_at: row.expires_at,
        used_at: row.used_at,
        created_at: row.created_at
      },
      user: {
        id: row.user_id,
        email: row.email,
        name: row.name,
        email_verified_at: row.email_verified_at,
        is_active: row.is_active
      }
    }
  }

  /**
   * Create email verification token for user
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    // Invalidate existing email verification tokens
    await this.invalidateUserTokens(userId, 'email_verification')

    // Create new token
    const tokenRecord = await this.createToken({
      user_id: userId,
      type: 'email_verification',
      expires_in_minutes: 24 * 60 // 24 hours
    })

    return tokenRecord.token
  }

  /**
   * Create password reset token for user
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    // Invalidate existing password reset tokens
    await this.invalidateUserTokens(userId, 'password_reset')

    // Create new token
    const tokenRecord = await this.createToken({
      user_id: userId,
      type: 'password_reset',
      expires_in_minutes: 60 // 1 hour
    })

    return tokenRecord.token
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{
    success: boolean
    user?: any
    error?: string
  }> {
    return transaction(async (client: PoolClient) => {
      // Find and validate token
      const tokenData = await this.verifyTokenAndGetUser(token, 'email_verification')
      if (!tokenData) {
        return {
          success: false,
          error: 'Invalid or expired verification token'
        }
      }

      // Mark token as used
      await client.query(
        'UPDATE auth_tokens SET used_at = NOW() WHERE token = $1',
        [token]
      )

      // Mark email as verified
      const result = await client.query(
        `UPDATE users 
         SET email_verified_at = NOW(), is_active = true 
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [tokenData.user.id]
      )

      if (!result.rows[0]) {
        return {
          success: false,
          error: 'User not found or already deleted'
        }
      }

      return {
        success: true,
        user: result.rows[0]
      }
    })
  }

  /**
   * Validate password reset token
   */
  async validatePasswordResetToken(token: string): Promise<{
    valid: boolean
    user?: any
    error?: string
  }> {
    const tokenData = await this.verifyTokenAndGetUser(token, 'password_reset')
    
    if (!tokenData) {
      return {
        valid: false,
        error: 'Invalid or expired reset token'
      }
    }

    if (!tokenData.user.is_active) {
      return {
        valid: false,
        error: 'Account is not active'
      }
    }

    return {
      valid: true,
      user: tokenData.user
    }
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPasswordHash: string): Promise<{
    success: boolean
    user?: any
    error?: string
  }> {
    return transaction(async (client: PoolClient) => {
      // Validate token
      const validation = await this.validatePasswordResetToken(token)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Mark token as used
      await client.query(
        'UPDATE auth_tokens SET used_at = NOW() WHERE token = $1',
        [token]
      )

      // Update password
      const result = await client.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id, email, name`,
        [newPasswordHash, validation.user!.id]
      )

      if (!result.rows[0]) {
        return {
          success: false,
          error: 'Failed to update password'
        }
      }

      // Invalidate all other sessions/tokens for security
      await client.query(
        'UPDATE auth_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [validation.user!.id]
      )

      return {
        success: true,
        user: result.rows[0]
      }
    })
  }

  private getDefaultExpirationMinutes(type: string): number {
    switch (type) {
      case 'email_verification':
        return 24 * 60 // 24 hours
      case 'password_reset':
        return 60 // 1 hour
      case 'login_verification':
        return 15 // 15 minutes
      default:
        return 60 // 1 hour default
    }
  }
}

// Create the auth_tokens table if it doesn't exist
export async function ensureAuthTokensTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      INDEX (token),
      INDEX (user_id, type),
      INDEX (expires_at)
    )
  `, [])

  // Create index for cleanup
  await query(`
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_cleanup 
    ON auth_tokens(expires_at) 
    WHERE used_at IS NULL
  `, [])
}

// Export singleton instance
export const tokenService = new TokenService()
export default tokenService