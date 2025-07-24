"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { VisionCategory } from "@/types"
import { Heart, Briefcase, Users, BookOpen, Check } from "lucide-react"

interface Step1CategoriesProps {
  selectedCategories: VisionCategory[]
  onCategoryToggle: (category: VisionCategory) => void
}

const categoryConfig = {
  health: {
    icon: Heart,
    title: "Health & Fitness",
    description: "Physical wellness, nutrition, and vitality",
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
  },
  career: {
    icon: Briefcase,
    title: "Career Growth",
    description: "Professional development and success",
    gradient: "from-blue-500 to-indigo-600", 
    bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
  },
  relationships: {
    icon: Users,
    title: "Relationships",
    description: "Personal connections and social bonds",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20"
  },
  "personal-growth": {
    icon: BookOpen,
    title: "Personal Growth", 
    description: "Learning, mindfulness, and self-improvement",
    gradient: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20"
  }
}

export default function Step1Categories({ 
  selectedCategories, 
  onCategoryToggle 
}: Step1CategoriesProps) {
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Choose the areas of life you want to transform. You can select multiple categories.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Select at least 2 categories</strong> to create a balanced transformation plan.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 gap-4">
        {(Object.entries(categoryConfig) as [VisionCategory, typeof categoryConfig[VisionCategory]][]).map(
          ([category, config]) => {
            const Icon = config.icon
            const isSelected = selectedCategories.includes(category)

            return (
              <Card
                key={category}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                  "border-2 overflow-hidden",
                  isSelected 
                    ? "border-primary shadow-lg scale-[1.02]" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onCategoryToggle(category)}
              >
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-90",
                  config.bgGradient
                )} />

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br shadow-sm",
                      config.gradient
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold font-display">
                        {config.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection State */}
                  <div className={cn(
                    "mt-4 pt-4 border-t border-border/50 text-center transition-all duration-200",
                    isSelected 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground"
                  )}>
                    {isSelected ? "Selected for your transformation" : "Tap to select"}
                  </div>
                </div>
              </Card>
            )
          }
        )}
      </div>

      {/* Selection Summary */}
      {selectedCategories.length > 0 && (
        <div className="text-center p-4 bg-primary/10 dark:bg-primary/5 rounded-xl">
          <p className="text-sm font-medium">
            {selectedCategories.length} {selectedCategories.length === 1 ? 'area' : 'areas'} selected
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedCategories.length >= 2 
              ? "Great! You can proceed to the next step" 
              : "Select at least one more area to continue"
            }
          </p>
        </div>
      )}
    </div>
  )
}