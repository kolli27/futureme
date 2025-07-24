"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: "default" | "teal" | "purple" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  label?: string
  animated?: boolean
  striped?: boolean
}

const variantStyles = {
  default: "from-teal-500 to-purple-600",
  teal: "from-teal-400 to-teal-600",
  purple: "from-purple-400 to-purple-600",
  success: "from-green-400 to-green-600",
  warning: "from-yellow-400 to-orange-500",
  error: "from-red-400 to-red-600",
}

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className,
    value,
    max = 100,
    variant = "default",
    size = "md",
    showLabel = false,
    label,
    animated = false,
    striped = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const gradientClass = variantStyles[variant]
    const sizeClass = sizeStyles[size]

    return (
      <div ref={ref} className={cn("w-full space-y-2", className)} {...props}>
        {/* Label */}
        {(showLabel || label) && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">
              {label || "Progress"}
            </span>
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress Container */}
        <div className={cn(
          "relative w-full rounded-full bg-secondary overflow-hidden",
          sizeClass
        )}>
          {/* Progress Fill */}
          <div 
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
              gradientClass,
              animated && "animate-pulse",
              striped && "bg-striped"
            )}
            style={{ width: `${percentage}%` }}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Striped Pattern Overlay */}
          {striped && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)",
              }}
            />
          )}
        </div>

        {/* Value Display */}
        {size === "lg" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export { ProgressBar }