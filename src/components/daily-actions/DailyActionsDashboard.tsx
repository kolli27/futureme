"use client"

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { GradientButton } from "@/components/ui/gradient-button"
import ActionCard from "./ActionCard"
import { useVisions } from "@/hooks/useVisions"
import { useTimeBudget } from "@/hooks/useTimeBudget"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { DailyAction, TimeBudgetAllocation } from "@/types"
import { mockAI } from "@/utils/aiUtils"
import { minutesToHoursMinutes } from "@/utils/timeUtils"
import { CheckCircle2, Clock, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DailyActionsDashboardProps {
  onAllActionsComplete?: () => void
}

export function DailyActionsDashboard({ onAllActionsComplete }: DailyActionsDashboardProps) {
  const { visions } = useVisions()
  const { totalAllocated } = useTimeBudget()
  const [dailyActions, setDailyActions] = useLocalStorage<DailyAction[]>('daily-actions', [])
  const [actionTimes, setActionTimes] = useLocalStorage<{ [actionId: string]: number }>('action-times', {})
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0])

  // Generate daily actions if needed
  useEffect(() => {
    if (visions.length > 0 && dailyActions.length === 0) {
      const newActions = mockAI.generateDailyActions(visions, currentDate)
      setDailyActions(newActions)
    } else if (dailyActions.length > 0) {
      // Check if actions are from today, if not regenerate
      const isToday = dailyActions.every(action => action.date === currentDate)
      if (!isToday) {
        const newActions = mockAI.generateDailyActions(visions, currentDate)
        setDailyActions(newActions)
        setActionTimes({}) // Reset timer data for new day
      }
    }
  }, [visions, dailyActions, currentDate, setDailyActions, setActionTimes])

  // Calculate progress
  const completedActions = dailyActions.filter(action => action.completed)
  const totalActions = dailyActions.length
  const completionRate = totalActions > 0 ? (completedActions.length / totalActions) * 100 : 0
  const allActionsComplete = totalActions > 0 && completedActions.length === totalActions

  // Calculate time statistics
  const totalTimeSpent = Object.values(actionTimes).reduce((sum, time) => sum + time, 0)
  const estimatedTotalTime = dailyActions.reduce((sum, action) => sum + (action.estimatedTime * 60), 0)
  const timeSavings = estimatedTotalTime - totalTimeSpent
  const efficiency = estimatedTotalTime > 0 ? ((estimatedTotalTime - totalTimeSpent) / estimatedTotalTime) * 100 : 0

  // Handle action completion
  const handleActionComplete = useCallback((actionId: string, actualTime?: number) => {
    setDailyActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, completed: true, actualTime: actualTime ? Math.round(actualTime / 60) : action.estimatedTime }
        : action
    ))
    
    if (actualTime) {
      setActionTimes(prev => ({ ...prev, [actionId]: actualTime }))
    }
  }, [setDailyActions, setActionTimes])

  // Handle manual completion toggle
  const handleToggleComplete = useCallback((actionId: string) => {
    setDailyActions(prev => prev.map(action => {
      if (action.id === actionId) {
        const newCompleted = !action.completed
        return {
          ...action,
          completed: newCompleted,
          actualTime: newCompleted && !action.actualTime ? action.estimatedTime : action.actualTime
        }
      }
      return action
    }))
  }, [setDailyActions])

  // Handle timer updates
  const handleTimerUpdate = useCallback((actionId: string, timeSpent: number) => {
    setActionTimes(prev => ({ ...prev, [actionId]: timeSpent }))
  }, [setActionTimes])

  // Handle complete all actions
  const handleCompleteAll = useCallback(() => {
    if (allActionsComplete && onAllActionsComplete) {
      onAllActionsComplete()
    }
  }, [allActionsComplete, onAllActionsComplete])

  // Get vision icon
  const getVisionIcon = (visionId: string) => {
    const vision = visions.find(v => v.id === visionId)
    if (!vision) return <Target className="h-4 w-4" />
    
    switch (vision.category) {
      case 'health': return <span className="text-base">🏃</span>
      case 'career': return <span className="text-base">💼</span>
      case 'relationships': return <span className="text-base">👥</span>
      case 'personal-growth': return <span className="text-base">🌱</span>
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Target className="h-8 w-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-gradient-primary">
            Today's Focus
          </h1>
          <p className="text-muted-foreground">
            Small actions, big transformation
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Actions Completed</span>
              <span className="text-muted-foreground">
                {completedActions.length} of {totalActions}
              </span>
            </div>
            <ProgressBar
              value={completedActions.length}
              max={totalActions}
              variant={allActionsComplete ? "success" : "teal"}
              size="lg"
              className="mb-2"
            />
            <div className="text-center">
              <span className={cn(
                "text-2xl font-bold",
                allActionsComplete ? "text-green-600" : "text-primary"
              )}>
                {Math.round(completionRate)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">complete</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Time Spent</span>
              </div>
              <span className="font-semibold">
                {minutesToHoursMinutes(Math.round(totalTimeSpent / 60))}
              </span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Efficiency</span>
              </div>
              <span className={cn(
                "font-semibold",
                efficiency > 0 ? "text-green-600" : efficiency < -20 ? "text-red-600" : "text-foreground"
              )}>
                {timeSavings > 0 ? '+' : ''}{minutesToHoursMinutes(Math.round(Math.abs(timeSavings) / 60))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Actions */}
      {dailyActions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-display">Your Actions Today</h2>
          
          {dailyActions.map((action) => {
            const vision = visions.find(v => v.id === action.visionId)
            return (
              <Card key={action.id} className={cn(
                "transition-all duration-300",
                action.completed && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Large Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(action.id)}
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        action.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      {action.completed && (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Action Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getVisionIcon(action.visionId || '')}
                          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                            {vision?.category?.replace('-', ' ') || 'Action'}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "text-lg font-medium leading-relaxed",
                          action.completed && "line-through text-muted-foreground"
                        )}>
                          {action.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>~{action.estimatedTime} minutes</span>
                          {actionTimes[action.id] && (
                            <span className="text-primary">
                              • {Math.round(actionTimes[action.id] / 60)}min spent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timer Progress */}
                      {actionTimes[action.id] && (
                        <div className="space-y-2">
                          <ProgressBar
                            value={actionTimes[action.id] / 60}
                            max={action.estimatedTime}
                            variant={actionTimes[action.id] > action.estimatedTime * 60 ? "warning" : "teal"}
                            size="sm"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!action.completed && (
                        <div className="flex gap-2 pt-2">
                          <GradientButton
                            size="sm"
                            onClick={() => handleActionComplete(action.id)}
                            className="flex-1"
                          >
                            Mark Complete
                          </GradientButton>
                        </div>
                      )}

                      {action.completed && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 pt-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium">Completed!</span>
                          {action.actualTime && (
                            <span className="text-sm">
                              ({action.actualTime}min)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Complete your time budget to generate daily actions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Complete All Button */}
      {totalActions > 0 && (
        <GradientButton
          size="lg"
          className="w-full"
          onClick={handleCompleteAll}
          disabled={!allActionsComplete}
        >
          {allActionsComplete ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Celebrate Your Victory!
            </>
          ) : (
            <>
              Complete All Actions ({completedActions.length}/{totalActions})
            </>
          )}
        </GradientButton>
      )}

      {/* Motivational Message */}
      {allActionsComplete && (
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
          <CardContent className="text-center py-6">
            <div className="space-y-2">
              <div className="text-2xl">🎉</div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                Amazing work! You've completed all your daily actions.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Every action brings you closer to your transformation
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DailyActionsDashboard