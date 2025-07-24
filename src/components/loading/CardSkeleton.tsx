"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"  
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardSkeletonProps {
  showAvatar?: boolean
  showHeader?: boolean
  lines?: number
  className?: string
}

export default function CardSkeleton({
  showAvatar = false,
  showHeader = true,
  lines = 3,
  className
}: CardSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {showAvatar && (
              <Skeleton className="h-10 w-10 rounded-full" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-3",
              i === lines - 1 ? "w-[60%]" : "w-full"
            )} 
          />
        ))}
      </CardContent>
    </Card>
  )
}

// Specific skeleton variants for different components
export function ActionCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[60px]" />
        </div>
      </CardContent>
    </Card>
  )
}

export function VisionCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-4 w-[60px] rounded-full" />
            </div>
            <Skeleton className="h-3 w-[180px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-6 w-[60px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}