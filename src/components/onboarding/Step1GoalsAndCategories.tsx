"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { VisionCategory, OnboardingGoal } from "@/types"
import { Heart, Briefcase, Users, BookOpen, Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step1GoalsAndCategoriesProps {
  goals: OnboardingGoal[]
  onGoalsChange: (goals: OnboardingGoal[]) => void
}

const categoryConfig = {
  health: {
    icon: Heart,
    title: "Health & Fitness",
    description: "Physical wellness, nutrition, and vitality",
    gradient: "from-green-500 to-emerald-600",
    placeholder: "e.g., work out more, eat healthier, run a marathon"
  },
  career: {
    icon: Briefcase,
    title: "Career Growth",
    description: "Professional development and success",
    gradient: "from-blue-500 to-indigo-600",
    placeholder: "e.g., get promoted, start a business, learn new skills"
  },
  relationships: {
    icon: Users,
    title: "Relationships",
    description: "Personal connections and social bonds",
    gradient: "from-pink-500 to-rose-600",
    placeholder: "e.g., surprise wife weekly, make new friends, call family more"
  },
  "personal-growth": {
    icon: BookOpen,
    title: "Personal Growth",
    description: "Learning, mindfulness, and self-improvement",
    gradient: "from-purple-500 to-violet-600",
    placeholder: "e.g., public speaking, meditation, read more books"
  }
}

export default function Step1GoalsAndCategories({ 
  goals, 
  onGoalsChange 
}: Step1GoalsAndCategoriesProps) {
  const [customCategories, setCustomCategories] = React.useState<string[]>([])
  const [newCategoryName, setNewCategoryName] = React.useState("")

  const addGoal = (category: VisionCategory | string) => {
    const newGoal: OnboardingGoal = {
      id: `goal_${Date.now()}`,
      category,
      title: "",
      vision: ""
    }
    onGoalsChange([...goals, newGoal])
  }

  const updateGoal = (goalId: string, field: 'title' | 'vision', value: string) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, [field]: value } : goal
    )
    onGoalsChange(updatedGoals)
  }

  const removeGoal = (goalId: string) => {
    onGoalsChange(goals.filter(goal => goal.id !== goalId))
  }

  const addCustomCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      setCustomCategories([...customCategories, newCategoryName.trim()])
      setNewCategoryName("")
    }
  }

  const getGoalsForCategory = (category: string) => {
    return goals.filter(goal => goal.category === category)
  }

  const allCategories = [...Object.keys(categoryConfig) as VisionCategory[], ...customCategories]
  const canProceed = goals.length >= 2 && goals.every(goal => goal.title.trim().length > 0)

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Instructions */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display">
            What do you want to achieve?
          </h2>
          <p className="text-white/80 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            Add specific goals for each area of your life. Be concrete - instead of just "health", 
            write "work out 3x per week" or "lose 20 pounds".
          </p>
          <p className="text-sm sm:text-base text-white/60">
            <strong>Add at least 2 goals</strong> across different areas to create a balanced transformation plan.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {allCategories.map((category) => {
            const config = categoryConfig[category as VisionCategory]
            const categoryGoals = getGoalsForCategory(category)
            const Icon = config?.icon || BookOpen

            return (
              <div
                key={category}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-sm",
                    config?.gradient || "from-gray-500 to-gray-600"
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                      {config?.title || category}
                    </h3>
                    <p className="text-sm text-white/70">
                      {config?.description || "Custom category"}
                    </p>
                  </div>
                </div>

                {/* Goals List */}
                <div className="space-y-3">
                  {categoryGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
                            placeholder={config?.placeholder || "Enter your goal..."}
                            className="w-full bg-transparent text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] rounded px-3 py-2 border border-white/20"
                          />
                        </div>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="text-white/50 hover:text-red-400 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Goal Button */}
                  <button
                    onClick={() => addGoal(category)}
                    className="w-full p-4 border-2 border-dashed border-white/30 rounded-lg text-white/60 hover:text-white hover:border-[#a50cf2]/50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add goal</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Custom Category */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Add Custom Category</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Finance, Hobbies, Travel..."
              className="flex-1 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] rounded px-4 py-3 border border-white/20"
              onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
            />
            <Button
              onClick={addCustomCategory}
              className="bg-[#a50cf2] hover:bg-[#9305d9] text-white px-6"
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Progress Summary */}
        {goals.length > 0 && (
          <div className="text-center p-6 bg-[#a50cf2]/20 rounded-xl border border-[#a50cf2]/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              {canProceed && <Check className="h-5 w-5 text-green-400" />}
              <p className="text-lg font-medium text-white">
                {goals.length} {goals.length === 1 ? 'goal' : 'goals'} added
              </p>
            </div>
            <p className="text-sm text-white/70">
              {canProceed 
                ? "Perfect! Ready to describe your 5-year vision for each goal" 
                : `Add ${Math.max(0, 2 - goals.length)} more goal${2 - goals.length === 1 ? '' : 's'} to continue`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}