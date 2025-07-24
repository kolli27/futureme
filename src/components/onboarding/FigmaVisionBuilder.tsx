"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { VisionCategory } from "@/types"

interface VisionInput {
  category: VisionCategory
  description: string
}

interface FigmaVisionBuilderProps {
  visionInputs: VisionInput[]
  onVisionChange: (category: VisionCategory, description: string) => void
  onBack?: () => void
  onNext?: () => void
  currentStep?: number
  totalSteps?: number
}

const categoryConfig = {
  health: {
    title: "Health",
    placeholder: "In 5 years, I want to be..."
  },
  career: {
    title: "Career", 
    placeholder: "In 5 years, I want to be..."
  },
  relationships: {
    title: "Relationships",
    placeholder: "In 5 years, I want to be..."
  },
  "personal-growth": {
    title: "Personal Growth",
    placeholder: "In 5 years, I want to be..."
  }
}

export default function FigmaVisionBuilder({
  visionInputs,
  onVisionChange,
  onBack,
  onNext,
  currentStep = 1,
  totalSteps = 3
}: FigmaVisionBuilderProps) {
  const getVisionText = (category: VisionCategory) => {
    return visionInputs.find(v => v.category === category)?.description || ""
  }

  const categories: VisionCategory[] = ['health', 'career', 'relationships', 'personal-growth']

  // Check if all visions are complete (minimum 10 characters)
  const allVisionsComplete = categories.every(category => {
    const visionText = getVisionText(category)
    return visionText.length >= 10
  })

  // Create progress dots based on current step
  const progressDots = Array.from({ length: totalSteps }, (_, index) => (
    <div
      key={index}
      className={cn(
        "h-2 w-2 rounded-full",
        index === currentStep - 1 ? "bg-[#a50cf2]" : "bg-[#563168]"
      )}
    />
  ))

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-between">
          <button 
            onClick={onBack}
            className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Vision Builder
          </h2>
        </div>

        {/* Progress Dots */}
        <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
          {progressDots}
        </div>

        {/* Main Content */}
        <h1 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Craft Your Future
        </h1>
        <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
          Envision your ideal life in the next 5 years. What do you want to achieve in health, career, relationships, and personal growth?
        </p>

        {/* Vision Categories */}
        {categories.map((category) => {
          const config = categoryConfig[category]
          const visionText = getVisionText(category)

          return (
            <div key={category}>
              <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                {config.title}
              </h3>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <textarea
                    placeholder={config.placeholder}
                    value={visionText}
                    onChange={(e) => onVisionChange(category, e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#563168] bg-[#2b1834] focus:border-[#563168] min-h-36 placeholder:text-[#b790cb] p-[15px] text-base font-normal leading-normal transition-colors duration-200 hover:border-[#6d4a7b]"
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={allVisionsComplete ? onNext : undefined}
            disabled={!allVisionsComplete}
            className={cn(
              "flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-200",
              allVisionsComplete
                ? "bg-[#a50cf2] hover:bg-[#9305d9] active:scale-95 transform"
                : "bg-[#563168] cursor-not-allowed opacity-60"
            )}
          >
            <span className="truncate">
              {allVisionsComplete ? "Next" : `Complete ${categories.filter(c => getVisionText(c).length < 10).length} more`}
            </span>
          </button>
        </div>
        <div className="h-5 bg-[#1d1023]" />
      </div>
    </div>
  )
}