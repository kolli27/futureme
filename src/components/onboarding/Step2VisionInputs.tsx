"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { VisionCategory } from "@/types"
import { Heart, Briefcase, Users, BookOpen } from "lucide-react"

interface VisionInput {
  category: VisionCategory
  description: string
}

interface Step2VisionInputsProps {
  selectedCategories: VisionCategory[]
  visionInputs: VisionInput[]
  onVisionChange: (category: VisionCategory, description: string) => void
}

const categoryConfig = {
  health: {
    icon: Heart,
    title: "Health & Fitness",
    placeholder: "a marathon runner who inspires others with my energy and vitality...",
    gradient: "from-green-500 to-emerald-600",
    examples: [
      "run a marathon and maintain peak physical fitness",
      "have boundless energy and inspire others with my healthy lifestyle",
      "practice yoga daily and find balance in mind and body"
    ]
  },
  career: {
    icon: Briefcase,
    title: "Career Growth", 
    placeholder: "a successful leader who makes a meaningful impact in my field...",
    gradient: "from-blue-500 to-indigo-600",
    examples: [
      "lead a team of 50+ people and drive innovation in my industry",
      "launch my own successful business that solves real problems",
      "be recognized as an expert speaker in my field"
    ]
  },
  relationships: {
    icon: Users,
    title: "Relationships",
    placeholder: "surrounded by deep, meaningful relationships with family and friends...",
    gradient: "from-pink-500 to-rose-600",
    examples: [
      "have a loving family and be present for all important moments",
      "maintain lifelong friendships with genuine, supportive people",
      "be the person others turn to for advice and support"
    ]
  },
  "personal-growth": {
    icon: BookOpen,
    title: "Personal Growth",
    placeholder: "constantly learning and growing, with wisdom that comes from experience...",
    gradient: "from-purple-500 to-violet-600",
    examples: [
      "speak three languages fluently and understand different cultures",
      "have inner peace and emotional intelligence to handle any situation",
      "be a lifelong learner who never stops growing and improving"
    ]
  }
}

export default function Step2VisionInputs({
  selectedCategories,
  visionInputs,
  onVisionChange
}: Step2VisionInputsProps) {
  const [focusedCategory, setFocusedCategory] = React.useState<VisionCategory | null>(null)

  const getVisionText = (category: VisionCategory) => {
    return visionInputs.find(v => v.category === category)?.description || ""
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Describe your ideal future self in each area. Be specific and inspiring!
        </p>
        <p className="text-sm text-muted-foreground">
          Start each vision with <strong>"In 5 years, I want to be..."</strong>
        </p>
      </div>

      {/* Vision Input Cards */}
      <div className="space-y-4">
        {selectedCategories.map((category) => {
          const config = categoryConfig[category]
          const Icon = config.icon
          const visionText = getVisionText(category)
          const isFocused = focusedCategory === category
          const isCompleted = visionText.length >= 10

          return (
            <Card 
              key={category}
              className={cn(
                "transition-all duration-300",
                isFocused && "ring-2 ring-primary shadow-lg",
                isCompleted && "border-green-500/50 bg-green-50/50 dark:bg-green-950/10"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    config.gradient
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold font-display">
                      {config.title}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {visionText.length >= 10 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✓ Vision complete ({visionText.length} characters)
                        </span>
                      ) : (
                        <span>
                          In 5 years, I want to be... ({visionText.length}/10 min)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Text Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder={`In 5 years, I want to be ${config.placeholder}`}
                    value={visionText}
                    onChange={(e) => onVisionChange(category, e.target.value)}
                    onFocus={() => setFocusedCategory(category)}
                    onBlur={() => setFocusedCategory(null)}
                    className={cn(
                      "min-h-[100px] resize-none transition-all",
                      isCompleted && "border-green-500/50"
                    )}
                  />
                  
                  <div className="text-xs text-muted-foreground text-right">
                    {visionText.length} characters
                  </div>
                </div>

                {/* Examples (shown when focused or empty) */}
                {(isFocused || visionText.length === 0) && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Example visions:
                    </div>
                    <div className="space-y-1">
                      {config.examples.map((example, index) => (
                        <button
                          key={index}
                          className="block w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
                          onClick={() => onVisionChange(category, `In 5 years, I want to be ${example}`)}
                        >
                          "In 5 years, I want to be {example}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="text-center p-4 bg-primary/10 dark:bg-primary/5 rounded-xl">
        <p className="text-sm font-medium">
          {visionInputs.filter(v => v.description.length >= 10).length} of {selectedCategories.length} visions completed
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {visionInputs.filter(v => v.description.length >= 10).length === selectedCategories.length
            ? "Amazing! Your visions are ready for prioritization" 
            : "Complete all visions to continue"
          }
        </p>
      </div>
    </div>
  )
}