"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { VisionCategory } from "@/types"
import { Heart, Briefcase, Users, BookOpen, GripVertical, Trophy } from "lucide-react"

interface VisionWithPriority {
  category: VisionCategory
  description: string
  priority: number
}

interface Step3PriorityRankingProps {
  visions: VisionWithPriority[]
  onReorder: (reorderedVisions: VisionWithPriority[]) => void
}

const categoryConfig = {
  health: {
    icon: Heart,
    title: "Health & Fitness",
    gradient: "from-green-500 to-emerald-600",
  },
  career: {
    icon: Briefcase,
    title: "Career Growth",
    gradient: "from-blue-500 to-indigo-600",
  },
  relationships: {
    icon: Users,
    title: "Relationships",
    gradient: "from-pink-500 to-rose-600",
  },
  "personal-growth": {
    icon: BookOpen,
    title: "Personal Growth",
    gradient: "from-purple-500 to-violet-600",
  }
}

interface SortableVisionCardProps {
  vision: VisionWithPriority
  index: number
}

function SortableVisionCard({ vision, index }: SortableVisionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vision.category })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = categoryConfig[vision.category]
  const Icon = config.icon

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "shadow-2xl scale-105 rotate-1 z-50",
        !isDragging && "hover:shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Priority Number */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
              index === 0 && "bg-yellow-500",
              index === 1 && "bg-gray-400", 
              index === 2 && "bg-orange-600",
              index >= 3 && "bg-muted"
            )}>
              {index === 0 && <Trophy className="h-4 w-4" />}
              {index !== 0 && (index + 1)}
            </div>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Vision Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br",
                config.gradient
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold font-display text-sm">
                  {config.title}
                </h3>
                <div className="text-xs text-muted-foreground">
                  {index === 0 && "🏆 Highest Priority"}
                  {index === 1 && "🥈 Second Priority"}
                  {index === 2 && "🥉 Third Priority"}
                  {index >= 3 && `Priority ${index + 1}`}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {vision.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Step3PriorityRanking({
  visions,
  onReorder
}: Step3PriorityRankingProps) {
  const [orderedVisions, setOrderedVisions] = React.useState(
    [...visions].sort((a, b) => a.priority - b.priority)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    setOrderedVisions([...visions].sort((a, b) => a.priority - b.priority))
  }, [visions])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = orderedVisions.findIndex(v => v.category === active.id)
      const newIndex = orderedVisions.findIndex(v => v.category === over?.id)

      const newOrder = arrayMove(orderedVisions, oldIndex, newIndex)
      const updatedVisions = newOrder.map((vision, index) => ({
        ...vision,
        priority: index + 1
      }))

      setOrderedVisions(updatedVisions)
      onReorder(updatedVisions)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Drag and drop to rank your visions by priority. Your top priority will get the most daily focus time.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Higher priority = more daily time allocation</strong>
        </p>
      </div>

      {/* Priority Guide */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="space-y-1">
          <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
            <Trophy className="h-3 w-3 text-white" />
          </div>
          <div className="text-muted-foreground">Most Time</div>
        </div>
        <div className="space-y-1">
          <div className="w-6 h-6 bg-gray-400 rounded-full mx-auto text-white font-bold text-xs flex items-center justify-center">
            2
          </div>
          <div className="text-muted-foreground">Balanced</div>
        </div>
        <div className="space-y-1">
          <div className="w-6 h-6 bg-orange-600 rounded-full mx-auto text-white font-bold text-xs flex items-center justify-center">
            3
          </div>
          <div className="text-muted-foreground">Foundation</div>
        </div>
      </div>

      {/* Sortable Vision List */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={orderedVisions.map(v => v.category)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {orderedVisions.map((vision, index) => (
              <SortableVisionCard
                key={vision.category}
                vision={vision}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Ranking Summary */}
      <div className="text-center p-4 bg-primary/10 dark:bg-primary/5 rounded-xl">
        <p className="text-sm font-medium">
          Priority ranking complete!
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Your transformation plan will focus most on <strong>{categoryConfig[orderedVisions[0]?.category]?.title}</strong>
        </p>
      </div>
    </div>
  )
}