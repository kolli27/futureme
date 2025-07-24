"use client"

import * as React from "react"
import { Trophy as TrophyIcon, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrophyProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "gold" | "silver" | "bronze" | "gradient"
  animated?: boolean
  showSparkles?: boolean
  sparkleCount?: number
}

const Trophy = React.forwardRef<HTMLDivElement, TrophyProps>(
  ({ 
    className,
    size = "md",
    variant = "gradient",
    animated = true,
    showSparkles = true,
    sparkleCount = 8,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      // Trigger animation after mount
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }, [])

    const sizeClasses = {
      sm: "w-16 h-16",
      md: "w-24 h-24", 
      lg: "w-32 h-32",
      xl: "w-48 h-48"
    }

    const iconSizes = {
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-16 w-16", 
      xl: "h-24 w-24"
    }

    const variantStyles = {
      gold: "from-yellow-400 via-yellow-500 to-yellow-600",
      silver: "from-gray-300 via-gray-400 to-gray-500",
      bronze: "from-orange-400 via-orange-500 to-orange-600",
      gradient: "from-teal-400 via-blue-500 to-purple-600"
    }

    const sparklePositions = React.useMemo(() => {
      return Array.from({ length: sparkleCount }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 1,
        size: 0.5 + Math.random() * 0.5
      }))
    }, [sparkleCount])

    return (
      <div 
        ref={ref}
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Main Trophy */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full p-4 shadow-2xl transition-all duration-1000",
          "bg-gradient-to-br",
          variantStyles[variant],
          animated && isVisible && "scale-100 rotate-0",
          animated && !isVisible && "scale-0 rotate-180"
        )}>
          {/* Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-50 transition-opacity duration-1000",
            "bg-gradient-to-br",
            variantStyles[variant],
            animated && isVisible && "opacity-50",
            animated && !isVisible && "opacity-0"
          )} />
          
          {/* Trophy Icon */}
          <TrophyIcon 
            className={cn(
              "relative z-10 text-white drop-shadow-lg transition-all duration-1000",
              iconSizes[size],
              animated && isVisible && "scale-100",
              animated && !isVisible && "scale-0"
            )}
          />
        </div>

        {/* Sparkles */}
        {showSparkles && sparklePositions.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              top: `${sparkle.top}%`,
              left: `${sparkle.left}%`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
            }}
          >
            <Star 
              className={cn(
                "text-yellow-400 animate-sparkle",
                sparkle.size > 0.8 ? "h-4 w-4" : sparkle.size > 0.6 ? "h-3 w-3" : "h-2 w-2",
                animated && "opacity-0 animate-sparkle"
              )}
              style={{
                animationDelay: `${sparkle.delay}s`,
              }}
            />
          </div>
        ))}

        {/* Floating Sparkles */}
        {showSparkles && animated && (
          <>
            <Sparkles 
              className={cn(
                "absolute top-2 right-2 text-yellow-300 animate-bounce-slow",
                size === "xl" ? "h-6 w-6" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
              )}
              style={{ animationDelay: "0.5s" }}
            />
            <Sparkles 
              className={cn(
                "absolute bottom-2 left-2 text-yellow-300 animate-bounce-slow",
                size === "xl" ? "h-6 w-6" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
              )}
              style={{ animationDelay: "1s" }}
            />
            <Sparkles 
              className={cn(
                "absolute top-1/2 left-0 text-yellow-300 animate-bounce-slow",
                size === "xl" ? "h-5 w-5" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
              )}
              style={{ animationDelay: "1.5s" }}
            />
          </>
        )}

        {/* Pulse Ring */}
        {animated && (
          <div className={cn(
            "absolute inset-0 rounded-full border-4 border-white/30 animate-ping",
            isVisible ? "opacity-75" : "opacity-0"
          )} />
        )}
      </div>
    )
  }
)

Trophy.displayName = "Trophy"

export default Trophy