"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { OnboardingGoal, VisionCategory } from "@/types"
import { Heart, Briefcase, Users, BookOpen, ChevronLeft, ChevronRight, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step2VisionBuilderProps {
  goals: OnboardingGoal[]
  onGoalsChange: (goals: OnboardingGoal[]) => void
}

const categoryConfig = {
  health: {
    icon: Heart,
    title: "Health & Fitness",
    gradient: "from-green-500 to-emerald-600",
    color: "text-green-400"
  },
  career: {
    icon: Briefcase,
    title: "Career Growth",
    gradient: "from-blue-500 to-indigo-600",
    color: "text-blue-400"
  },
  relationships: {
    icon: Users,
    title: "Relationships",
    gradient: "from-pink-500 to-rose-600",
    color: "text-pink-400"
  },
  "personal-growth": {
    icon: BookOpen,
    title: "Personal Growth",
    gradient: "from-purple-500 to-violet-600",
    color: "text-purple-400"
  }
}

export default function Step2VisionBuilder({ 
  goals, 
  onGoalsChange 
}: Step2VisionBuilderProps) {
  const [currentGoalIndex, setCurrentGoalIndex] = React.useState(0)
  
  const currentGoal = goals[currentGoalIndex]
  const config = categoryConfig[currentGoal?.category as VisionCategory]
  const Icon = config?.icon || Target

  const updateGoalVision = (vision: string) => {
    const updatedGoals = goals.map((goal, index) => 
      index === currentGoalIndex ? { ...goal, vision } : goal
    )
    onGoalsChange(updatedGoals)
  }

  const goToNextGoal = () => {
    if (currentGoalIndex < goals.length - 1) {
      setCurrentGoalIndex(currentGoalIndex + 1)
    }
  }

  const goToPreviousGoal = () => {
    if (currentGoalIndex > 0) {
      setCurrentGoalIndex(currentGoalIndex - 1)
    }
  }

  const canProceed = goals.every(goal => goal.vision.trim().length >= 20)
  const completedGoals = goals.filter(goal => goal.vision.trim().length >= 20).length

  if (!currentGoal) {
    return (
      <div className="min-h-screen bg-[#1d1023] flex items-center justify-center">
        <p className="text-white">No goals found. Please go back to add some goals.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br",
              config?.gradient || "from-gray-500 to-gray-600"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Goal {currentGoalIndex + 1} of {goals.length}
            </h2>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-[#a50cf2] to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentGoalIndex + 1) / goals.length) * 100}%` }}
            />
          </div>

          <div className="text-center space-y-2">
            <p className={cn("text-sm font-medium", config?.color || "text-gray-400")}>
              {config?.title || currentGoal.category}
            </p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display">
              {currentGoal.title}
            </h3>
          </div>
        </div>

        {/* Vision Input */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 sm:p-8">
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-center">
                In 5 years, what does success look like for this goal?
              </h4>
              <p className="text-white/70 text-center text-sm sm:text-base">
                Paint a vivid picture of your ideal future. Be specific about what you'll have achieved, 
                how you'll feel, and what your life will look like.
              </p>
              
              <div className="relative">
                <textarea
                  value={currentGoal.vision}
                  onChange={(e) => updateGoalVision(e.target.value)}
                  placeholder={`In 5 years, I will have ${currentGoal.title}. I envision myself...`}
                  className="w-full h-48 sm:h-56 bg-white/10 border border-white/20 rounded-lg p-4 sm:p-6 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent resize-none text-base leading-relaxed"
                />
                <div className="absolute bottom-4 right-4 text-xs text-white/50">
                  {currentGoal.vision.length}/500 characters
                </div>
              </div>
            </div>
          </div>

          {/* Examples/Tips */}
          <div className="bg-[#a50cf2]/10 border border-[#a50cf2]/30 rounded-lg p-4 sm:p-6">
            <h5 className="font-bold text-[#a50cf2] mb-3">💡 Make it vivid and specific:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <p className="font-medium text-green-400 mb-1">Good examples:</p>
                <ul className="space-y-1 text-xs">
                  <li>• "I run marathons and feel energetic all day"</li>
                  <li>• "I lead a team of 20 people at my company"</li>
                  <li>• "My spouse and I take monthly weekend getaways"</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-400 mb-1">Too vague:</p>
                <ul className="space-y-1 text-xs">
                  <li>• "I'm healthier"</li>
                  <li>• "I have a better job"</li>
                  <li>• "My relationships improve"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              onClick={goToPreviousGoal}
              disabled={currentGoalIndex === 0}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Goal
            </Button>

            <div className="text-center">
              <p className="text-sm text-white/60">
                {completedGoals} of {goals.length} visions complete
              </p>
              {currentGoal.vision.length >= 20 && (
                <p className="text-xs text-green-400 mt-1">✓ Vision complete</p>
              )}
            </div>

            {currentGoalIndex < goals.length - 1 ? (
              <Button
                onClick={goToNextGoal}
                className="bg-[#a50cf2] hover:bg-[#9305d9] text-white"
              >
                Next Goal
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={!canProceed}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                Complete Visions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        {goals.length > 1 && (
          <div className="mt-8 p-4 bg-white/5 rounded-lg">
            <h5 className="font-medium text-white mb-3">All Goals Progress:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {goals.map((goal, index) => {
                const goalConfig = categoryConfig[goal.category as VisionCategory]
                const GoalIcon = goalConfig?.icon || Target
                const isComplete = goal.vision.trim().length >= 20
                const isCurrent = index === currentGoalIndex

                return (
                  <button
                    key={goal.id}
                    onClick={() => setCurrentGoalIndex(index)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                      isCurrent 
                        ? "border-[#a50cf2] bg-[#a50cf2]/20" 
                        : "border-white/20 bg-white/5 hover:bg-white/10",
                      isComplete && !isCurrent && "border-green-500/50 bg-green-500/10"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br flex-shrink-0",
                      goalConfig?.gradient || "from-gray-500 to-gray-600"
                    )}>
                      <GoalIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {goal.title}
                      </p>
                      <p className="text-xs text-white/60">
                        {isComplete ? "✓ Complete" : `${goal.vision.length}/20 chars`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}