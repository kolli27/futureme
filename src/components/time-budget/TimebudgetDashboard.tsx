"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { GradientButton } from "@/components/ui/gradient-button"
import TimeSlider from "./TimeSlider"
import TimeAllocationCard from "./TimeAllocationCard"
import { useVisions } from "@/hooks/useVisions"
import { useTimeBudget } from "@/hooks/useTimeBudget"
import { TimeBudgetAllocation } from "@/types"
import { minutesToHoursMinutes } from "@/utils/timeUtils"
import { Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimebudgetDashboardProps {
  onComplete?: (allocation: TimeBudgetAllocation) => void
}

export function TimebudgetDashboard({ onComplete }: TimebudgetDashboardProps) {
  const { visions } = useVisions()
  const {
    totalAvailableTime,
    allocations,
    totalAllocated,
    remainingTime,
    isFullyAllocated,
    updateTotalTime,
    updateAllocation,
    assignAllTimeEqually,
    createAllocation
  } = useTimeBudget()

  // Handle assign all time
  const handleAssignAllTime = useCallback(() => {
    const visionIds = visions.map(v => v.id)
    assignAllTimeEqually(visionIds)
  }, [visions, assignAllTimeEqually])

  // Handle completion
  const handleComplete = useCallback(() => {
    if (!isFullyAllocated || !onComplete) return
    const allocation = createAllocation()
    onComplete(allocation)
  }, [isFullyAllocated, createAllocation, onComplete])

  const getVisionIcon = (category: string) => {
    const iconProps = { className: "h-5 w-5" }
    switch (category) {
      case 'health': return <span {...iconProps}>🏃</span>
      case 'career': return <span {...iconProps}>💼</span>
      case 'relationships': return <span {...iconProps}>👥</span>
      case 'personal-growth': return <span {...iconProps}>🌱</span>
      default: return <Clock {...iconProps} />
    }
  }

  const getVisionColor = (category: string) => {
    switch (category) {
      case 'health': return 'success'
      case 'career': return 'teal'
      case 'relationships': return 'purple'
      case 'personal-growth': return 'warning'
      default: return 'teal'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Clock className="h-8 w-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-gradient-primary">
            Today's Time Budget
          </h1>
          <p className="text-muted-foreground">
            Allocate your available time across your visions
          </p>
        </div>
      </div>

      {/* Total Time Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSlider
            label="Total Available Time"
            value={totalAvailableTime}
            max={480} // 8 hours max
            onChange={updateTotalTime}
            color="teal"
            icon={<Clock className="h-4 w-4" />}
            step={15}
          />
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Time Allocation Progress</span>
            <span className="text-lg font-semibold">
              {minutesToHoursMinutes(totalAllocated)} / {minutesToHoursMinutes(totalAvailableTime)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar
            value={totalAllocated}
            max={totalAvailableTime}
            variant={remainingTime === 0 ? "success" : remainingTime < 0 ? "error" : "teal"}
            size="lg"
            className="mb-4"
          />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Assigned: {minutesToHoursMinutes(totalAllocated)}
            </span>
            <span className={cn(
              "font-semibold",
              remainingTime === 0 ? "text-green-600" : remainingTime < 0 ? "text-red-600" : "text-foreground"
            )}>
              Remaining: {minutesToHoursMinutes(Math.max(0, remainingTime))}
              {remainingTime < 0 && ` (Over by ${minutesToHoursMinutes(Math.abs(remainingTime))})`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Vision Allocations */}
      {visions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-display">Allocate Time to Your Visions</h2>
          
          {visions
            .sort((a, b) => a.priority - b.priority)
            .map((vision) => (
              <TimeAllocationCard
                key={vision.id}
                vision={vision}
                allocatedTime={allocations[vision.id] || 0}
                totalAvailableTime={totalAvailableTime}
                onChange={(value) => updateAllocation(vision.id, value)}
              />
            ))
          }
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No visions found. Please complete the onboarding process first.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {visions.length > 0 && !isFullyAllocated && (
          <GradientButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleAssignAllTime}
          >
            Assign All Time Equally
          </GradientButton>
        )}
        
        <GradientButton
          size="lg"
          className="w-full"
          onClick={handleComplete}
          disabled={!isFullyAllocated}
        >
          {isFullyAllocated ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Time Budget
            </>
          ) : (
            `Assign All Time (${minutesToHoursMinutes(remainingTime)} remaining)`
          )}
        </GradientButton>
      </div>

      {/* Validation Messages */}
      {visions.length > 0 && (
        <div className="text-center space-y-2">
          {remainingTime > 0 && (
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                You have {minutesToHoursMinutes(remainingTime)} unallocated time remaining
              </p>
            </div>
          )}
          
          {remainingTime < 0 && (
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                You've over-allocated by {minutesToHoursMinutes(Math.abs(remainingTime))}
              </p>
            </div>
          )}
          
          {isFullyAllocated && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Perfect! All time is allocated
              </p>
            </div>
          )}
          
          {!isFullyAllocated && (
            <p className="text-xs text-muted-foreground">
              You must allocate all your available time before proceeding
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default TimebudgetDashboard