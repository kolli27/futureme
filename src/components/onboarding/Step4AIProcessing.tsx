"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Brain, Sparkles, Target, Zap, CheckCircle2 } from "lucide-react"
import LoadingSpinner from "@/components/loading/LoadingSpinner"

interface Step4AIProcessingProps {
  visionCount: number
  onComplete: () => void
}

const processingSteps = [
  {
    icon: Brain,
    title: "Analyzing Your Visions",
    description: "Understanding your transformation goals"
  },
  {
    icon: Target,
    title: "Creating Action Plan", 
    description: "Designing personalized daily actions"
  },
  {
    icon: Zap,
    title: "Optimizing Time Budget",
    description: "Calculating optimal time allocation"
  },
  {
    icon: Sparkles,
    title: "Personalizing Experience",
    description: "Tailoring AI recommendations"
  }
]

export default function Step4AIProcessing({
  visionCount,
  onComplete
}: Step4AIProcessingProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < processingSteps.length - 1) {
          return prev + 1
        } else {
          clearInterval(timer)
          setTimeout(() => {
            setIsComplete(true)
            setTimeout(onComplete, 1000) // 1 second delay before completion
          }, 500)
          return prev
        }
      })
    }, 750) // 750ms per step = ~3 seconds total

    return () => clearInterval(timer)
  }, [onComplete])

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white">
        <div className="container mx-auto px-6 py-8 max-w-md">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="h-12 w-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold font-display text-[#a50cf2]">
                Your Transformation Plan is Ready!
              </h2>
              <p className="text-white/80">
                AI has crafted a personalized journey for your {visionCount} life areas
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      <div className="container mx-auto px-6 py-8 max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            className="mx-auto w-20 h-20 bg-gradient-to-br from-[#a50cf2] to-purple-600 rounded-2xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-10 w-10 text-white" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-white">
              AI is Building Your Plan
            </h2>
            <p className="text-sm text-white/70">
              Please wait while we create your personalized transformation journey
            </p>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isUpcoming = index > currentStep

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isUpcoming ? 0.3 : 1, 
                  x: 0,
                  scale: isActive ? 1.02 : 1
                }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all duration-300 bg-white/5 backdrop-blur-sm border",
                  isActive && "border-[#a50cf2]/50 shadow-sm shadow-[#a50cf2]/20",
                  isCompleted && "border-green-500/50 bg-green-500/10",
                  isUpcoming && "border-white/20"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  isCompleted && "bg-green-500",
                  isActive && "bg-gradient-to-br from-[#a50cf2] to-purple-600",
                  isUpcoming && "bg-white/20"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : isActive ? (
                    <div className="relative">
                      <Icon className="h-6 w-6 text-white" />
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                  ) : (
                    <Icon className={cn(
                      "h-6 w-6",
                      isUpcoming ? "text-white/40" : "text-white"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold font-display transition-colors",
                    isCompleted && "text-green-400",
                    isActive && "text-[#a50cf2]",
                    isUpcoming && "text-white/60"
                  )}>
                    {step.title}
                    {isCompleted && " ✓"}
                    {isActive && (
                      <span className="ml-2">
                        <LoadingSpinner size="sm" variant="dots" />
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-white/70">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Processing...</span>
            <span className="text-[#a50cf2] font-medium">
              {Math.round(((currentStep + 1) / processingSteps.length) * 100)}%
            </span>
          </div>
          
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#a50cf2] to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Fun Facts */}
        <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
          <p className="text-xs text-white/70">
            💡 <strong>Did you know?</strong> It takes an average of 66 days to form a new habit. 
            Your AI plan will help you build lasting changes step by step.
          </p>
        </div>
      </div>
    </div>
  )
}