"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "gradient" | "dots"
}

export default function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "gradient",
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-2", className)} {...props}>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-transparent",
        sizeClasses[size],
        variant === "gradient" 
          ? "bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-border"
          : "border-primary border-t-transparent"
      )}>
        {variant === "gradient" && (
          <div className="w-full h-full rounded-full bg-background m-0.5" />
        )}
      </div>
    </div>
  )
}