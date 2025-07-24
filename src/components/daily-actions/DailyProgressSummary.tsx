"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVisions } from "@/hooks/useVisions"
import { useTimeBudget } from "@/hooks/useTimeBudget"
import { minutesToHoursMinutes } from "@/utils/timeUtils"
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Award,
  Zap,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DailyProgressSummaryProps {
  className?: string
  variant?: "full" | "compact"
}

export function DailyProgressSummary({ 
  className, 
  variant = "full" 
}: DailyProgressSummaryProps) {
  const { visions } = useVisions()
  const { totalAllocated, remainingTime } = useTimeBudget()
  const {
    dailyActions,
    completedActions,
    totalActions,
    completionRate,
    allActionsComplete,
    totalTimeSpent,
    estimatedTotalTime,
    timeSavings
  } = useDailyActions()

  // Calculate vision-specific progress
  const visionProgress = React.useMemo(() => {
    return visions.map(vision => {
      const visionActions = dailyActions.filter(action => action.visionId === vision.id)
      const completedVisionActions = visionActions.filter(action => action.completed)
      const visionCompletionRate = visionActions.length > 0 
        ? (completedVisionActions.length / visionActions.length) * 100 
        : 0

      return {
        vision,
        totalActions: visionActions.length,
        completedActions: completedVisionActions.length,
        completionRate: visionCompletionRate
      }
    }).filter(vp => vp.totalActions > 0)
  }, [visions, dailyActions])

  // Calculate efficiency metrics
  const efficiency = estimatedTotalTime > 0 
    ? ((estimatedTotalTime - totalTimeSpent) / estimatedTotalTime) * 100 
    : 0
  
  const isEfficient = efficiency > 0
  const timeStatus = timeSavings > 0 ? 'saved' : timeSavings < 0 ? 'over' : 'exact'

  // Get vision icon
  const getVisionIcon = (category: string) => {
    switch (category) {
      case 'health': return <span className="text-base">🏃</span>
      case 'career': return <span className="text-base">💼</span>
      case 'relationships': return <span className="text-base">👥</span>
      case 'personal-growth': return <span className="text-base">🌱</span>
      default: return <Target className="h-4 w-4" />
    }
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                allActionsComplete 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-primary/10"
              )}>
                {allActionsComplete ? (
                  <Award className="h-4 w-4 text-green-600" />
                ) : (
                  <Target className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {completedActions.length}/{totalActions} Actions
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(completionRate)}% complete
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "text-sm font-semibold",
                isEfficient ? "text-green-600" : "text-amber-600"
              )}>
                {timeSavings > 0 ? '+' : ''}{minutesToHoursMinutes(Math.abs(Math.round(timeSavings / 60)))}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeStatus}
              </p>
            </div>
          </div>
          
          <ProgressBar
            value={completedActions.length}
            max={totalActions}
            variant={allActionsComplete ? "success" : "teal"}
            size="sm"
            className="mt-3"
          />
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Daily Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Actions Completed</h3>
                <p className="text-sm text-muted-foreground">
                  {completedActions.length} of {totalActions} actions done
                </p>
              </div>
              <div className={cn(
                "text-3xl font-bold",
                allActionsComplete ? "text-green-600" : "text-primary"
              )}>
                {Math.round(completionRate)}%
              </div>
            </div>
            
            <ProgressBar
              value={completedActions.length}
              max={totalActions}
              variant={allActionsComplete ? "success" : "teal"}
              size="lg"
              animated={!allActionsComplete}
            />
          </div>

          {/* Time Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Time Spent
                </span>
              </div>
              <div className="font-semibold">
                {minutesToHoursMinutes(Math.round(totalTimeSpent / 60))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Estimated
                </span>
              </div>
              <div className="font-semibold">
                {minutesToHoursMinutes(Math.round(estimatedTotalTime / 60))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {isEfficient ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {timeStatus}
                </span>
              </div>
              <div className={cn(
                "font-semibold",
                isEfficient ? "text-green-600" : "text-amber-600"
              )}>
                {minutesToHoursMinutes(Math.abs(Math.round(timeSavings / 60)))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vision-Specific Progress */}
      {visionProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Progress by Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visionProgress.map(({ vision, totalActions, completedActions, completionRate }) => (
              <div key={vision.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getVisionIcon(vision.category)}
                    <div>
                      <p className="font-medium text-sm">{vision.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {vision.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                      {completedActions}/{totalActions}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                </div>
                
                <ProgressBar
                  value={completedActions}
                  max={totalActions}
                  variant={completionRate === 100 ? "success" : "teal"}
                  size="sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Achievement Badge */}
      {allActionsComplete && (
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
          <CardContent className="text-center py-6">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                  Day Complete! 🎉
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  You've finished all your daily actions
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-green-600 dark:text-green-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Day {new Date().getDate()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{minutesToHoursMinutes(Math.round(totalTimeSpent / 60))} spent</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DailyProgressSummary