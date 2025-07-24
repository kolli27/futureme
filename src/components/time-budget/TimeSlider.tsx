"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/ui/progress-bar"
import { minutesToHoursMinutes } from "@/utils/timeUtils"

interface TimeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
  color?: "teal" | "purple" | "success" | "warning" | "error"
  icon?: React.ReactNode
  disabled?: boolean
  step?: number
}

const TimeSlider = React.forwardRef<HTMLDivElement, TimeSliderProps>(
  ({ 
    className,
    label,
    value,
    max,
    onChange,
    color = "teal",
    icon,
    disabled = false,
    step = 5,
    ...props 
  }, ref) => {
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
      const rawValue = percentage * max
      const steppedValue = Math.round(rawValue / step) * step
      
      onChange(Math.min(Math.max(steppedValue, 0), max))
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

    const percentage = (value / max) * 100

    return (
      <div 
        ref={ref}
        className={cn(
          "space-y-4 p-4 rounded-xl border bg-card transition-all",
          isDragging && "shadow-lg scale-[1.02]",
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br",
                color === "teal" && "from-teal-500 to-teal-600",
                color === "purple" && "from-purple-500 to-purple-600",
                color === "success" && "from-green-500 to-green-600",
                color === "warning" && "from-yellow-500 to-orange-500",
                color === "error" && "from-red-500 to-red-600"
              )}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold font-display text-foreground">
                {label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {minutesToHoursMinutes(value)} / {minutesToHoursMinutes(max)}
              </p>
            </div>
          </div>
          
          {/* Time Badge */}
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r",
            color === "teal" && "from-teal-500 to-teal-600",
            color === "purple" && "from-purple-500 to-purple-600",
            color === "success" && "from-green-500 to-green-600",
            color === "warning" && "from-yellow-500 to-orange-500",
            color === "error" && "from-red-500 to-red-600"
          )}>
            {minutesToHoursMinutes(value)}
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          value={value} 
          max={max} 
          variant={color === "teal" ? "teal" : color === "purple" ? "purple" : color}
          size="lg"
        />

        {/* Interactive Slider */}
        <div className="space-y-2">
          <div 
            ref={sliderRef}
            className={cn(
              "relative h-6 bg-secondary rounded-full cursor-pointer touch-none",
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
                color === "teal" && "from-teal-400 to-teal-600",
                color === "purple" && "from-purple-400 to-purple-600",
                color === "success" && "from-green-400 to-green-600",
                color === "warning" && "from-yellow-400 to-orange-500",
                color === "error" && "from-red-400 to-red-600"
              )}
              style={{ width: `${percentage}%` }}
            />
            
            {/* Thumb */}
            <div 
              className={cn(
                "absolute top-1/2 w-6 h-6 rounded-full border-2 border-white bg-gradient-to-r shadow-lg transform -translate-y-1/2 transition-all",
                color === "teal" && "from-teal-500 to-teal-600",
                color === "purple" && "from-purple-500 to-purple-600",
                color === "success" && "from-green-500 to-green-600",
                color === "warning" && "from-yellow-500 to-orange-500",
                color === "error" && "from-red-500 to-red-600",
                isDragging && "scale-110 shadow-xl",
                disabled && "opacity-50"
              )}
              style={{ left: `calc(${percentage}% - 12px)` }}
            />
            
            {/* Step Markers */}
            <div className="absolute inset-0 flex items-center">
              {Array.from({ length: Math.floor(max / 30) + 1 }, (_, i) => {
                const stepValue = i * 30
                const stepPercentage = (stepValue / max) * 100
                return (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2 bg-muted-foreground/30 rounded-full"
                    style={{ left: `${stepPercentage}%` }}
                  />
                )
              })}
            </div>
          </div>

          {/* Quick Set Buttons */}
          <div className="flex gap-2 justify-center">
            {[15, 30, 60, 90].filter(v => v <= max).map((quickValue) => (
              <button
                key={quickValue}
                onClick={() => !disabled && onChange(quickValue)}
                disabled={disabled}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  value === quickValue 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "hover:bg-accent hover:text-accent-foreground",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {quickValue}m
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

TimeSlider.displayName = "TimeSlider"

export default TimeSlider