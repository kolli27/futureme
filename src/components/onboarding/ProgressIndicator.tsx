"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: { title: string; description?: string }[]
  className?: string
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  className
}: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-1 bg-secondary rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            
            return (
              <div
                key={index}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-gradient-to-r from-teal-500 to-purple-600 border-transparent",
                  isCurrent && "border-primary bg-background scale-110",
                  !isCompleted && !isCurrent && "border-muted bg-background"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <span className={cn(
                    "text-xs font-semibold",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {stepNumber}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold font-display">
          {steps[currentStep - 1]?.title}
        </h2>
        {steps[currentStep - 1]?.description && (
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        )}
        <div className="text-xs text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    </div>
  )
}