"use client"

import * as React from "react"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { useTimer } from "@/hooks/useTimer"
import { formatTime } from "@/utils/timeUtils"

interface TimerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialTime: number // in seconds
  actionTitle?: string
  onComplete?: () => void
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
  variant?: "default" | "compact" | "large"
  autoStart?: boolean
}

const Timer = React.forwardRef<HTMLDivElement, TimerProps>(
  ({ 
    className,
    initialTime,
    actionTitle,
    onComplete,
    onPause,
    onResume,
    onStop,
    variant = "default",
    autoStart = false,
    ...props 
  }, ref) => {
    const {
      timeRemaining,
      isRunning,
      start,
      pause,
      reset,
      progress
    } = useTimer(initialTime, onComplete)

    React.useEffect(() => {
      if (autoStart) {
        start()
      }
    }, [autoStart, start])

    const handlePlayPause = () => {
      if (isRunning) {
        pause()
        onPause?.()
      } else {
        start()
        onResume?.()
      }
    }

    const handleStop = () => {
      pause()
      reset()
      onStop?.()
    }

    const handleReset = () => {
      reset()
    }

    // Compact variant for small spaces
    if (variant === "compact") {
      return (
        <div 
          ref={ref}
          className={cn("flex items-center gap-2", className)}
          {...props}
        >
          <Button
            size="sm"
            variant={isRunning ? "secondary" : "default"}
            onClick={handlePlayPause}
            className="h-6 w-6 p-0"
          >
            {isRunning ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <span className="text-sm font-mono tabular-nums">
            {formatTime(timeRemaining)}
          </span>
        </div>
      )
    }

    // Large variant for focus mode
    if (variant === "large") {
      return (
        <div 
          ref={ref}
          className={cn(
            "flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-card border shadow-lg max-w-md mx-auto",
            className
          )}
          {...props}
        >
          {actionTitle && (
            <h2 className="text-xl font-display font-semibold text-center mb-6">
              {actionTitle}
            </h2>
          )}

          {/* Large Timer Display */}
          <div className="relative mb-8">
            <div className="text-6xl font-mono font-bold text-center tabular-nums">
              {formatTime(timeRemaining)}
            </div>
            <div className="absolute -inset-4 rounded-full border-4 border-primary/20" />
            <div 
              className="absolute -inset-4 rounded-full border-4 border-transparent"
              style={{
                background: `conic-gradient(from 0deg, hsl(var(--primary)) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Progress */}
          <div className="w-full mb-8">
            <ProgressBar 
              value={progress} 
              max={100} 
              variant="default"
              size="lg"
              showLabel
              label="Progress"
            />
          </div>

          {/* Large Controls */}
          <div className="flex gap-4">
            <GradientButton
              size="lg"
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full"
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </GradientButton>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleStop}
              className="w-16 h-16 rounded-full"
            >
              <Square className="h-6 w-6" />
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              onClick={handleReset}
              className="w-16 h-16 rounded-full"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div 
        ref={ref}
        className={cn(
          "flex flex-col space-y-4 p-6 rounded-xl border bg-card shadow-sm",
          className
        )}
        {...props}
      >
        {actionTitle && (
          <div className="text-center">
            <h3 className="font-semibold font-display text-lg">
              {actionTitle}
            </h3>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold tabular-nums mb-2">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRunning ? "Running" : "Paused"}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142.1 76.2% 36.3%)" />
                <stop offset="100%" stopColor="hsl(262.1 83.3% 57.8%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <GradientButton
            size="lg"
            onClick={handlePlayPause}
            className="px-8"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </GradientButton>
          
          <Button
            size="lg"
            variant="outline"
            onClick={handleStop}
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    )
  }
)

Timer.displayName = "Timer"

export default Timer