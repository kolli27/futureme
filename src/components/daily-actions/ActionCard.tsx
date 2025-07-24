"use client"

import * as React from "react"
import { Clock, Play, Pause, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { GradientButton } from "@/components/ui/gradient-button"
import { ProgressBar } from "@/components/ui/progress-bar"
import Timer from "@/components/timer/Timer"
import { DailyAction } from "@/types"
import { formatTime } from "@/utils/timeUtils"

interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  action: DailyAction
  onComplete?: (actionId: string, actualTime?: number) => void
  onToggleTimer?: (actionId: string) => void
  onMarkComplete?: (actionId: string) => void
  variant?: "default" | "compact" | "focus"
  showTimer?: boolean
  isTimerRunning?: boolean
  timeSpent?: number
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    className,
    action,
    onComplete,
    onToggleTimer,
    onMarkComplete,
    variant = "default",
    showTimer = true,
    isTimerRunning = false,
    timeSpent = 0,
    ...props 
  }, ref) => {
    const [localTimeSpent, setLocalTimeSpent] = React.useState(timeSpent)
    const [isExpanded, setIsExpanded] = React.useState(false)

    const progress = action.estimatedTime > 0 
      ? Math.min((localTimeSpent / (action.estimatedTime * 60)) * 100, 100)
      : 0

    const isCompleted = action.completed
    const isOvertime = localTimeSpent > (action.estimatedTime * 60)

    const handleTimerComplete = () => {
      setLocalTimeSpent(action.estimatedTime * 60)
      onComplete?.(action.id, action.estimatedTime * 60)
    }

    const handleMarkComplete = () => {
      onMarkComplete?.(action.id)
    }

    const handleToggleTimer = () => {
      onToggleTimer?.(action.id)
    }

    // Compact variant for lists
    if (variant === "compact") {
      return (
        <Card 
          ref={ref}
          className={cn(
            "transition-all duration-300 border-l-4",
            isCompleted 
              ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20" 
              : "border-l-primary hover:shadow-md",
            className
          )}
          {...props}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <Checkbox 
                checked={isCompleted}
                onCheckedChange={handleMarkComplete}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {action.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{action.estimatedTime}min</span>
                  {timeSpent > 0 && (
                    <span className="text-primary">
                      • {Math.round(timeSpent / 60)}min spent
                    </span>
                  )}
                </div>
              </div>

              {/* Timer Controls */}
              {showTimer && !isCompleted && (
                <Timer 
                  initialTime={action.estimatedTime * 60}
                  variant="compact"
                  onComplete={handleTimerComplete}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Focus variant for single action view
    if (variant === "focus") {
      return (
        <Card 
          ref={ref}
          className={cn(
            "max-w-md mx-auto border-0 shadow-xl bg-gradient-card",
            className
          )}
          {...props}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
              <h2 className="text-xl font-display font-semibold">
                Daily Action
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Action Description */}
            <div className="text-center">
              <p className="text-lg leading-relaxed px-4">
                {action.description}
              </p>
            </div>

            {/* Timer */}
            {showTimer && !isCompleted && (
              <Timer 
                initialTime={action.estimatedTime * 60}
                variant="large"
                actionTitle={action.description}
                onComplete={handleTimerComplete}
                autoStart={false}
              />
            )}

            {/* Progress */}
            {timeSpent > 0 && (
              <div className="space-y-2">
                <ProgressBar 
                  value={progress}
                  max={100}
                  variant={isOvertime ? "warning" : "default"}
                  showLabel
                  label="Progress"
                  animated
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(localTimeSpent)} spent</span>
                  <span>{formatTime(action.estimatedTime * 60)} estimated</span>
                </div>
              </div>
            )}

            {/* Complete Button */}
            {!isCompleted && (
              <GradientButton 
                onClick={handleMarkComplete}
                size="lg"
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Complete
              </GradientButton>
            )}
          </CardContent>
        </Card>
      )
    }

    // Default variant
    return (
      <Card 
        ref={ref}
        className={cn(
          "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          isCompleted && "opacity-75",
          className
        )}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <Checkbox 
              checked={isCompleted}
              onCheckedChange={handleMarkComplete}
              className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <p className={cn(
                "font-semibold leading-tight text-foreground",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {action.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{action.estimatedTime} minutes</span>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className={cn(
                "h-2 w-2 bg-current rounded-full transition-transform",
                isExpanded && "rotate-90"
              )} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Bar */}
          {localTimeSpent > 0 && (
            <div className="mb-4">
              <ProgressBar 
                value={progress}
                max={100}
                variant={isOvertime ? "warning" : "default"}
                size="sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{Math.round(localTimeSpent / 60)}min spent</span>
                <span>{progress.toFixed(0)}% complete</span>
              </div>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* Timer */}
              {showTimer && !isCompleted && (
                <Timer 
                  initialTime={action.estimatedTime * 60}
                  variant="default"
                  onComplete={handleTimerComplete}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isCompleted ? (
                  <GradientButton 
                    onClick={handleMarkComplete}
                    size="sm"
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </GradientButton>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed!
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

ActionCard.displayName = "ActionCard"

export default ActionCard