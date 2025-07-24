"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import ProgressIndicator from "@/components/onboarding/ProgressIndicator"
import Step1Categories from "@/components/onboarding/Step1Categories"
import Step2VisionInputs from "@/components/onboarding/Step2VisionInputs"
import FigmaVisionBuilder from "@/components/onboarding/FigmaVisionBuilder"
import Step3PriorityRanking from "@/components/onboarding/Step3PriorityRanking"
import Step4AIProcessing from "@/components/onboarding/Step4AIProcessing"
import PageTransition from "@/components/transitions/PageTransition"
import { useVisions } from "@/hooks/useVisions"
import { VisionCategory } from "@/types"
import { analyzeVisionDescription } from "@/lib/ai"

interface VisionInput {
  category: VisionCategory
  description: string
}

interface VisionWithPriority {
  category: VisionCategory
  description: string
  priority: number
}

const steps = [
  { title: "Choose Your Focus Areas", description: "Select life categories to transform" },
  { title: "Describe Your Visions", description: "Paint your ideal future self" },
  { title: "Set Your Priorities", description: "Rank visions by importance" },
  { title: "AI Processing", description: "Creating your personalized plan" }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { createVision, clearVisions } = useVisions()
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [selectedCategories, setSelectedCategories] = React.useState<VisionCategory[]>([])
  const [visionInputs, setVisionInputs] = React.useState<VisionInput[]>([])
  const [prioritizedVisions, setPrioritizedVisions] = React.useState<VisionWithPriority[]>([])

  // Step 1: Category selection
  const handleCategoryToggle = (category: VisionCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const canProceedFromStep1 = selectedCategories.length >= 2

  // Step 2: Vision inputs
  const handleVisionChange = (category: VisionCategory, description: string) => {
    setVisionInputs(prev => {
      const existing = prev.find(v => v.category === category)
      if (existing) {
        return prev.map(v => 
          v.category === category ? { ...v, description } : v
        )
      } else {
        return [...prev, { category, description }]
      }
    })
  }

  const canProceedFromStep2 = selectedCategories.every(category => {
    const vision = visionInputs.find(v => v.category === category)
    return vision && vision.description.length >= 10
  })

  // Step 3: Priority ranking
  const handleReorder = (reorderedVisions: VisionWithPriority[]) => {
    setPrioritizedVisions(reorderedVisions)
  }

  React.useEffect(() => {
    if (currentStep === 3 && prioritizedVisions.length === 0) {
      // Initialize prioritized visions when entering step 3
      const visions = selectedCategories.map((category, index) => {
        const input = visionInputs.find(v => v.category === category)
        return {
          category,
          description: input?.description || "",
          priority: index + 1
        }
      })
      setPrioritizedVisions(visions)
    }
  }, [currentStep, selectedCategories, visionInputs, prioritizedVisions.length])

  const canProceedFromStep3 = prioritizedVisions.length === selectedCategories.length

  // Step 4: AI Processing completion
  const handleAIProcessingComplete = async () => {
    // Clear any existing visions first
    clearVisions()
    
    // Process each vision with AI analysis
    for (const vision of prioritizedVisions) {
      try {
        // Analyze vision with AI to get complexity and suggestions
        const analysisResponse = await analyzeVisionDescription(
          vision.description,
          vision.category,
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
            category: vision.category,
            description: vision.description,
            timeAllocation,
            aiAnalysis: analysisResponse.data
          })
        } else {
          // Fallback to default if AI analysis fails
          createVision({
            category: vision.category,
            description: vision.description,
            timeAllocation
          })
        }
      } catch (error) {
        console.error('Failed to analyze vision:', error)
        // Fallback to default on error
        createVision({
          category: vision.category,
          description: vision.description,
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
          <Step1Categories
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        )
      case 2:
        return (
          <Step2VisionInputs
            selectedCategories={selectedCategories}
            visionInputs={visionInputs}
            onVisionChange={handleVisionChange}
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
            visionCount={selectedCategories.length}
            onComplete={handleAIProcessingComplete}
          />
        )
      default:
        return null
    }
  }

  // For Step 2, use the full-screen Figma design
  if (currentStep === 2) {
    return (
      <PageTransition>
        <FigmaVisionBuilder
          visionInputs={visionInputs}
          onVisionChange={handleVisionChange}
          onBack={handleBack}
          onNext={canProceedFromStep2 ? handleNext : undefined}
          currentStep={currentStep}
          totalSteps={4}
        />
      </PageTransition>
    )
  }

  return (
    <div className="min-h-screen-mobile bg-gradient-card">
      <PageTransition>
        <div className="container mx-auto px-6 py-8 max-w-md">
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
              <p className="text-xs text-muted-foreground">
                💡 Tip: Choose areas where you want to see the biggest changes in your life
              </p>
            )}
            {currentStep === 3 && (
              <p className="text-xs text-muted-foreground">
                💡 Tip: Your top priority will receive more daily focus time and actions
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  )
}