"use client"

import * as React from "react"
import CardSkeleton, { ActionCardSkeleton, VisionCardSkeleton } from "./CardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

// Dashboard loading state
export function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Header Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-[200px] mx-auto" />
        <Skeleton className="h-4 w-[150px] mx-auto" />
      </div>

      {/* Progress Card Skeleton */}
      <CardSkeleton lines={2} />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton showHeader={false} lines={2} />
        <CardSkeleton showHeader={false} lines={2} />
      </div>

      {/* Button Skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

// Actions page loading state
export function ActionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-[180px] mx-auto" />
        <Skeleton className="h-4 w-[220px] mx-auto" />
      </div>

      {/* Progress Summary */}
      <CardSkeleton lines={1} />

      {/* Action Cards */}
      <div className="space-y-4">
        <ActionCardSkeleton />
        <ActionCardSkeleton />
        <ActionCardSkeleton />
      </div>

      {/* Complete Button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

// Community page loading state
export function CommunityLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-4 w-[180px] mt-1" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Victory Posts */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} showAvatar lines={2} />
        ))}
      </div>

      {/* Share Victory Card */}
      <CardSkeleton showHeader={false} lines={2} />
    </div>
  )
}

// Profile page loading state  
export function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="absolute top-16 right-1/2 translate-x-12 h-6 w-6 rounded-full" />
        </div>
        <div>
          <Skeleton className="h-7 w-[150px] mx-auto" />
          <Skeleton className="h-4 w-[200px] mx-auto mt-2" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center p-4 border rounded-lg">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto mt-2" />
          </div>
        ))}
      </div>

      {/* Settings, Achievements, Goals */}
      <CardSkeleton lines={3} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={2} />

      {/* Edit Button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

// Insights page loading state
export function InsightsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-[120px] mx-auto" />
        <Skeleton className="h-4 w-[250px] mx-auto" />
      </div>

      {/* Analytics Cards */}
      <CardSkeleton lines={3} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={1} />

      {/* Premium Upgrade */}
      <CardSkeleton lines={3} />
    </div>
  )
}