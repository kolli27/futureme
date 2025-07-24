"use client"

import * as React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { GradientButton } from "@/components/ui/gradient-button"
import { DailyAction } from "@/types"
import { formatTime, minutesToHoursMinutes } from "@/utils/timeUtils"
import { Clock, Play, Pause, Square, CheckCircle2, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedActionCardProps {
  action: DailyAction
  onComplete?: (actionId: string, actualTime: number) => void
  onToggleComplete?: (actionId: string) => void
  onTimerUpdate?: (actionId: string, timeSpent: number) => void
  visionCategory?: string
  timeSpent?: number
  className?: string
}

export function EnhancedActionCard({
  action,
  onComplete,
  onToggleComplete,
  onTimerUpdate,
  visionCategory,
  timeSpent = 0,
  className
}: EnhancedActionCardProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(timeSpent)
  const [isExpanded, setIsExpanded] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && !action.completed) {
      startTimeRef.current = Date.now() - (currentTime * 1000)
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000)
        setCurrentTime(elapsed)
        onTimerUpdate?.(action.id, elapsed)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning, action.completed, action.id, onTimerUpdate])

  // Auto-complete when timer reaches estimated time
  useEffect(() => {
    if (currentTime >= action.estimatedTime * 60 && isTimerRunning) {
      handleTimerComplete()
    }
  }, [currentTime, action.estimatedTime, isTimerRunning])

  const handleStartTimer = useCallback(() => {
    setIsTimerRunning(true)
    setIsExpanded(true)
  }, [])

  const handlePauseTimer = useCallback(() => {
    setIsTimerRunning(false)
  }, [])

  const handleStopTimer = useCallback(() => {
    setIsTimerRunning(false)
    setCurrentTime(0)
    onTimerUpdate?.(action.id, 0)
  }, [action.id, onTimerUpdate])

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false)
    onComplete?.(action.id, currentTime)
  }, [action.id, currentTime, onComplete])

  const handleManualComplete = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
    }
    onToggleComplete?.(action.id)
  }, [action.id, isTimerRunning, onToggleComplete])

  const progress = action.estimatedTime > 0 ? Math.min((currentTime / (action.estimatedTime * 60)) * 100, 100) : 0
  const isOvertime = currentTime > action.estimatedTime * 60

  const getVisionIcon = (category?: string) => {
    const iconProps = { className: "h-5 w-5" }
    switch (category) {
      case 'health': return <span className="text-lg">🏃</span>
      case 'career': return <span className="text-lg">💼</span>
      case 'relationships': return <span className="text-lg">👥</span>
      case 'personal-growth': return <span className="text-lg">🌱</span>
      default: return <Target {...iconProps} />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'health': return 'border-green-200 dark:border-green-800'
      case 'career': return 'border-teal-200 dark:border-teal-800'
      case 'relationships': return 'border-purple-200 dark:border-purple-800'
      case 'personal-growth': return 'border-yellow-200 dark:border-yellow-800'
      default: return 'border-border'
    }
  }

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      action.completed && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      !action.completed && getCategoryColor(visionCategory),
      isTimerRunning && "ring-2 ring-primary/20 shadow-lg",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Large Satisfying Checkbox */}
          <button
            onClick={handleManualComplete}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all duration-300 transform hover:scale-110",
              action.completed
                ? "bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-lg"
                : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10 active:scale-95"
            )}
          >
            {action.completed && (
              <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {/* Action Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getVisionIcon(visionCategory)}
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {visionCategory?.replace('-', ' ') || 'Action'}
                </span>
              </div>
              
              <p className={cn(
                "text-lg font-semibold leading-relaxed",
                action.completed && "line-through text-muted-foreground"
              )}>
                {action.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Estimated: {action.estimatedTime}min</span>
                </div>
                {currentTime > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "font-medium",
                      isOvertime ? "text-amber-600" : "text-primary"
                    )}>
                      Spent: {Math.round(currentTime / 60)}min
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Progress */}
            {currentTime > 0 && (
              <div className="space-y-2">
                <ProgressBar
                  value={Math.min(currentTime / 60, action.estimatedTime)}
                  max={action.estimatedTime}
                  variant={isOvertime ? "warning" : "teal"}
                  size="sm"
                  animated={isTimerRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
            )}

            {/* Timer Display */}
            {(isTimerRunning || currentTime > 0) && (
              <div className="text-center py-4 bg-muted/50 rounded-lg">
                <div className={cn(
                  "text-3xl font-mono font-bold",
                  isTimerRunning ? "text-primary" : "text-muted-foreground"
                )}>
                  {formatTime(currentTime)}
                </div>
                {isTimerRunning && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Timer running...
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!action.completed && (
                <>
                  {/* Timer Controls */}
                  <div className="flex gap-2">
                    {!isTimerRunning ? (
                      <GradientButton
                        size="sm"
                        onClick={handleStartTimer}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </GradientButton>
                    ) : (
                      <GradientButton
                        size="sm"
                        variant="secondary"
                        onClick={handlePauseTimer}
                        className="flex-1"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </GradientButton>
                    )}
                    
                    {currentTime > 0 && (
                      <GradientButton
                        size="sm"
                        variant="secondary"
                        onClick={handleStopTimer}
                        className="px-4"
                      >
                        <Square className="h-4 w-4" />
                      </GradientButton>
                    )}
                  </div>

                  {/* Complete Button */}
                  <GradientButton
                    size="sm"
                    onClick={handleManualComplete}
                    className="w-full"
                    disabled={isTimerRunning}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </GradientButton>
                </>
              )}

              {/* Completion State */}
              {action.completed && (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 py-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Completed!</span>
                  {action.actualTime && (
                    <span className="text-sm">
                      ({action.actualTime}min)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedActionCard