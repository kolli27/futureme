"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Vision } from "@/types"
import { minutesToHoursMinutes } from "@/utils/timeUtils"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimeAllocationCardProps {
  vision: Vision
  allocatedTime: number
  totalAvailableTime: number
  onChange: (timeMinutes: number) => void
  disabled?: boolean
}

export function TimeAllocationCard({
  vision,
  allocatedTime,
  totalAvailableTime,
  onChange,
  disabled = false
}: TimeAllocationCardProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const sliderRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    handleMove(e)
  }

  const handleMove = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    if (disabled || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const rawValue = percentage * totalAvailableTime
    const steppedValue = Math.round(rawValue / 5) * 5 // 5-minute steps
    
    onChange(Math.min(Math.max(steppedValue, 0), totalAvailableTime))
  }

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e)
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault()
        handleMove(e)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  const percentage = (allocatedTime / totalAvailableTime) * 100

  const getVisionIcon = (category: string) => {
    const iconProps = { className: "h-6 w-6" }
    switch (category) {
      case 'health': return <span {...iconProps}>🏃</span>
      case 'career': return <span {...iconProps}>💼</span>
      case 'relationships': return <span {...iconProps}>👥</span>
      case 'personal-growth': return <span {...iconProps}>🌱</span>
      default: return <Clock {...iconProps} />
    }
  }

  const getGradientColors = (category: string) => {
    switch (category) {
      case 'health': return {
        bg: "from-green-500 to-green-600",
        track: "from-green-400 to-green-600",
        thumb: "from-green-500 to-green-600"
      }
      case 'career': return {
        bg: "from-teal-500 to-teal-600", 
        track: "from-teal-400 to-teal-600",
        thumb: "from-teal-500 to-teal-600"
      }
      case 'relationships': return {
        bg: "from-purple-500 to-purple-600",
        track: "from-purple-400 to-purple-600", 
        thumb: "from-purple-500 to-purple-600"
      }
      case 'personal-growth': return {
        bg: "from-yellow-500 to-orange-500",
        track: "from-yellow-400 to-orange-500",
        thumb: "from-yellow-500 to-orange-500"
      }
      default: return {
        bg: "from-teal-500 to-teal-600",
        track: "from-teal-400 to-teal-600", 
        thumb: "from-teal-500 to-teal-600"
      }
    }
  }

  const colors = getGradientColors(vision.category)

  return (
    <Card className={cn(
      "transition-all duration-200",
      isDragging && "shadow-lg scale-[1.02]",
      disabled && "opacity-50"
    )}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br text-white",
              colors.bg
            )}>
              {getVisionIcon(vision.category)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display text-foreground text-lg">
                {vision.description}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {vision.category.replace('-', ' ')} • Priority {vision.priority}
              </p>
            </div>
          </div>
          
          {/* Time Badge */}
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r",
            colors.bg
          )}>
            {minutesToHoursMinutes(allocatedTime)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Allocated Time</span>
            <span className="font-medium">
              {minutesToHoursMinutes(allocatedTime)} / {minutesToHoursMinutes(totalAvailableTime)}
            </span>
          </div>
          
          <ProgressBar 
            value={allocatedTime} 
            max={totalAvailableTime}
            variant={vision.category === 'health' ? 'success' : 
                     vision.category === 'career' ? 'teal' :
                     vision.category === 'relationships' ? 'purple' : 'warning'}
            size="lg"
          />
        </div>

        {/* Interactive Slider */}
        <div className="space-y-3">
          <div 
            ref={sliderRef}
            className={cn(
              "relative h-8 bg-secondary rounded-full cursor-pointer touch-none",
              disabled && "cursor-not-allowed"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
              if (disabled) return
              setIsDragging(true)
              handleMove(e)
            }}
          >
            {/* Track Fill */}
            <div 
              className={cn(
                "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all",
                colors.track
              )}
              style={{ width: `${percentage}%` }}
            />
            
            {/* Thumb */}
            <div 
              className={cn(
                "absolute top-1/2 w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r shadow-lg transform -translate-y-1/2 transition-all",
                colors.thumb,
                isDragging && "scale-110 shadow-xl",
                disabled && "opacity-50"
              )}
              style={{ left: `calc(${percentage}% - 16px)` }}
            />
            
            {/* Step Markers */}
            <div className="absolute inset-0 flex items-center">
              {Array.from({ length: Math.floor(totalAvailableTime / 30) + 1 }, (_, i) => {
                const stepValue = i * 30
                const stepPercentage = (stepValue / totalAvailableTime) * 100
                return (
                  <div
                    key={i}
                    className="absolute w-0.5 h-3 bg-muted-foreground/30 rounded-full"
                    style={{ left: `${stepPercentage}%` }}
                  />
                )
              })}
            </div>
          </div>

          {/* Quick Set Buttons */}
          <div className="flex gap-2 justify-center">
            {[15, 30, 60, 90, 120].filter(v => v <= totalAvailableTime).map((quickValue) => (
              <button
                key={quickValue}
                onClick={() => !disabled && onChange(quickValue)}
                disabled={disabled}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                  allocatedTime === quickValue 
                    ? cn("text-white bg-gradient-to-r border-transparent", colors.bg)
                    : "hover:bg-accent hover:text-accent-foreground border-border",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {quickValue}m
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimeAllocationCard