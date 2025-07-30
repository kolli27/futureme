"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import ProgressIndicator from "@/components/onboarding/ProgressIndicator"
import Step1GoalsAndCategories from "@/components/onboarding/Step1GoalsAndCategories"
import Step2VisionBuilder from "@/components/onboarding/Step2VisionBuilder"
import Step3PriorityRanking from "@/components/onboarding/Step3PriorityRanking"
import Step4AIProcessing from "@/components/onboarding/Step4AIProcessing"
import PageTransition from "@/components/transitions/PageTransition"
import { useVisions } from "@/hooks/useVisions"
import { VisionCategory, OnboardingGoal } from "@/types"
import { analyzeVisionDescription } from "@/lib/ai"

interface VisionWithPriority {
  id: string
  category: VisionCategory | string
  title: string
  vision: string
  priority: number
}

const steps = [
  { title: "Set Your Goals", description: "Define specific goals across life areas" },
  { title: "Envision Your Future", description: "Describe your 5-year vision for each goal" },
  { title: "Set Your Priorities", description: "Rank goals by importance" },
  { title: "AI Processing", description: "Creating your personalized plan" }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { createVision, clearVisions } = useVisions()
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [goals, setGoals] = React.useState<OnboardingGoal[]>([])
  const [prioritizedVisions, setPrioritizedVisions] = React.useState<VisionWithPriority[]>([])

  // Step 1: Goals setup
  const canProceedFromStep1 = goals.length >= 2 && goals.every(goal => goal.title.trim().length > 0)

  // Step 2: Vision inputs
  const canProceedFromStep2 = goals.every(goal => goal.vision.trim().length >= 20)

  // Step 3: Priority ranking
  const handleReorder = (reorderedVisions: VisionWithPriority[]) => {
    setPrioritizedVisions(reorderedVisions)
  }

  React.useEffect(() => {
    if (currentStep === 3 && prioritizedVisions.length === 0) {
      // Initialize prioritized visions when entering step 3
      const visions = goals.map((goal, index) => ({
        id: goal.id,
        category: goal.category,
        title: goal.title,
        vision: goal.vision,
        priority: index + 1
      }))
      setPrioritizedVisions(visions)
    }
  }, [currentStep, goals, prioritizedVisions.length])

  const canProceedFromStep3 = prioritizedVisions.length === goals.length

  // Step 4: AI Processing completion
  const handleAIProcessingComplete = async () => {
    // Clear any existing visions first
    clearVisions()
    
    // Process each prioritized goal with AI analysis
    for (const vision of prioritizedVisions) {
      try {
        // Analyze vision with AI to get complexity and suggestions
        const analysisResponse = await analyzeVisionDescription(
          `${vision.title}: ${vision.vision}`,
          typeof vision.category === 'string' ? vision.category as VisionCategory : vision.category,
          'default'
        )
        
        let timeAllocation = 30 // Default time allocation
        
        if (analysisResponse.success && analysisResponse.data) {
          // Use AI-suggested time allocation based on complexity
          const complexity = analysisResponse.data.timeComplexity
          switch (complexity) {
            case 'low':
              timeAllocation = 20
              break
            case 'medium':
              timeAllocation = 30
              break
            case 'high':
              timeAllocation = 45
              break
          }
          
          // Store AI analysis data with the vision for future use
          createVision({
            category: typeof vision.category === 'string' ? vision.category as VisionCategory : vision.category,
            description: `${vision.title}: ${vision.vision}`,
            timeAllocation,
            aiAnalysis: analysisResponse.data
          })
        } else {
          // Fallback to default if AI analysis fails
          createVision({
            category: typeof vision.category === 'string' ? vision.category as VisionCategory : vision.category,
            description: `${vision.title}: ${vision.vision}`,
            timeAllocation
          })
        }
      } catch (error) {
        console.error('Failed to analyze vision:', error)
        // Fallback to default on error
        createVision({
          category: typeof vision.category === 'string' ? vision.category as VisionCategory : vision.category,
          description: `${vision.title}: ${vision.vision}`,
          timeAllocation: 30
        })
      }
    }

    // Navigate to time budget setup
    router.push('/time-budget')
  }

  // Navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.push('/welcome')
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return canProceedFromStep1
      case 2: return canProceedFromStep2
      case 3: return canProceedFromStep3
      default: return false
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1GoalsAndCategories
            goals={goals}
            onGoalsChange={setGoals}
          />
        )
      case 2:
        return (
          <Step2VisionBuilder
            goals={goals}
            onGoalsChange={setGoals}
          />
        )
      case 3:
        return (
          <Step3PriorityRanking
            visions={prioritizedVisions}
            onReorder={handleReorder}
          />
        )
      case 4:
        return (
          <Step4AIProcessing
            visionCount={goals.length}
            onComplete={handleAIProcessingComplete}
          />
        )
      default:
        return null
    }
  }


  return (
    <div className="min-h-screen-mobile bg-[#1d1023]">
      <PageTransition>
        <div className="container mx-auto px-6 py-8 max-w-md md:max-w-2xl lg:max-w-4xl">
          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={4}
            steps={steps}
            className="mb-8"
          />

          {/* Step Content */}
          <div className="mb-8">
            {getStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <GradientButton
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                {currentStep === 3 ? "Start AI Processing" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </GradientButton>
            </div>
          )}

          {/* Step-specific help text */}
          <div className="mt-6 text-center">
            {currentStep === 1 && (
              <p className="text-xs text-white/60">
                💡 Tip: Be specific with your goals - "lose 20 pounds" is better than just "health"
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-xs text-white/60">
                💡 Tip: Paint a vivid picture - how will you feel, what will you be doing, who will you be?
              </p>
            )}
            {currentStep === 3 && (
              <p className="text-xs text-white/60">
                💡 Tip: Your top priority will receive more daily focus time and actions
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  )
}