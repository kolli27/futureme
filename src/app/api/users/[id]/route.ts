/**
 * User API Endpoints
 * 
 * CRUD operations for user management with proper authentication,
 * authorization, and GDPR compliance features.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { userModel } from '@/lib/db/models/user'
import { query } from '@/lib/db/config'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requestedUserId = params.id
    const currentUserId = session.user.id

    // Users can only access their own data (unless admin)
    if (requestedUserId !== currentUserId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only access your own user data' },
        { status: 403 }
      )
    }

    // Get user with progress and subscription data
    const userData = await userModel.findWithProgressAndSubscription(requestedUserId)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data from response
    const { password_hash, ...safeUserData } = userData.user
    
    return NextResponse.json({
      user: safeUserData,
      progress: userData.progress,
      subscription: userData.subscription
    })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requestedUserId = params.id
    const currentUserId = session.user.id

    // Users can only update their own data (unless admin)
    if (requestedUserId !== currentUserId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only update your own user data' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate and sanitize update data
    const allowedFields = [
      'name', 'display_name', 'avatar_url', 'timezone', 
      'locale', 'onboarding_completed'
    ]
    
    const updateData: any = {}
    Object.entries(body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    })

    // Validate specific fields
    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (updateData.timezone && typeof updateData.timezone !== 'string') {
      return NextResponse.json(
        { error: 'Invalid timezone format' },
        { status: 400 }
      )
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await userModel.update(requestedUserId, updateData)
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 }
      )
    }

    // Log the update for audit purposes
    await query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, new_values, ip_address)
       VALUES ($1, 'update', 'user', $2, $3, $4)`,
      [
        currentUserId,
        requestedUserId,
        JSON.stringify(updateData),
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      ]
    )

    // Remove sensitive data from response
    const { password_hash, ...safeUserData } = updatedUser
    
    return NextResponse.json({
      success: true,
      user: safeUserData
    })

  } catch (error) {
    console.error('Update user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requestedUserId = params.id
    const currentUserId = session.user.id

    // Users can only delete their own account (unless admin)
    if (requestedUserId !== currentUserId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only delete your own account' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { confirmDeletion, hardDelete = false } = body

    if (!confirmDeletion) {
      return NextResponse.json(
        { error: 'Account deletion must be confirmed' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await userModel.findById(requestedUserId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let deletionResult: boolean

    if (hardDelete && session.user.role === 'admin') {
      // Hard delete (permanent) - admin only
      deletionResult = await userModel.delete(requestedUserId)
    } else {
      // Soft delete (GDPR compliant)
      deletionResult = await userModel.softDelete(requestedUserId)
    }

    if (!deletionResult) {
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      )
    }

    // Log the deletion for audit purposes
    await query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_values, ip_address)
       VALUES ($1, 'delete_account', 'user', $2, $3, $4)`,
      [
        currentUserId,
        requestedUserId,
        JSON.stringify({ 
          deletion_type: hardDelete ? 'hard' : 'soft',
          email: user.email,
          name: user.name
        }),
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      ]
    )

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Account permanently deleted' : 'Account deactivated and data anonymized'
    })

  } catch (error) {
    console.error('Delete user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}