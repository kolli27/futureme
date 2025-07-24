"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Vision, VisionCategory } from "@/types"
import { Heart, Briefcase, Users, BookOpen, GripVertical } from "lucide-react"

interface VisionCardProps {
  vision?: Vision
  category: VisionCategory
  description?: string
  priority?: number
  timeAllocation?: number
  isEditing?: boolean
  isDragging?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onPriorityChange?: (newPriority: number) => void
  className?: string
}

const categoryConfig = {
  health: {
    icon: Heart,
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    label: "Health & Fitness",
    description: "Physical wellness and vitality"
  },
  career: {
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    label: "Career Growth",
    description: "Professional development and success"
  },
  relationships: {
    icon: Users,
    color: "from-pink-500 to-rose-600",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    label: "Relationships",
    description: "Personal connections and social bonds"
  },
  "personal-growth": {
    icon: BookOpen,
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
    label: "Personal Growth",
    description: "Learning and self-improvement"
  }
}

const VisionCard = React.forwardRef<HTMLDivElement, VisionCardProps>(
  ({ 
    vision, 
    category, 
    description, 
    priority = 1, 
    timeAllocation = 30,
    isEditing = false,
    isDragging = false,
    onEdit,
    onDelete,
    onPriorityChange,
    className,
    ...props 
  }, ref) => {
    const config = categoryConfig[category]
    const Icon = config.icon
    const visionText = description || vision?.description || ""

    return (
      <Card 
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          "border-0 shadow-md",
          isDragging && "rotate-2 shadow-2xl scale-105",
          className
        )}
        {...props}
      >
        {/* Gradient Background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", config.bgColor)} />
        
        {/* Drag Handle */}
        {isEditing && (
          <div className="absolute top-3 right-3 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <CardHeader className="relative pb-4">
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br shadow-sm",
              config.color
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">
                  {config.label}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Priority {priority}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Vision Description */}
          {visionText && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Your Vision
              </h4>
              <p className="text-foreground leading-relaxed">
                "{visionText}"
              </p>
            </div>
          )}

          {/* Time Allocation */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-sm font-medium text-muted-foreground">
              Daily Time
            </span>
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r",
                config.color
              )}>
                {timeAllocation}min
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <GradientButton size="sm" variant="outline" onClick={onEdit}>
                Edit
              </GradientButton>
              <GradientButton size="sm" variant="ghost" onClick={onDelete}>
                Remove
              </GradientButton>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

VisionCard.displayName = "VisionCard"

export default VisionCard