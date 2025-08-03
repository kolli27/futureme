"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Target, Clock, Brain, Calendar, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVisions } from "@/hooks/useVisions"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVictory } from "@/hooks/useVictory"
import { AuthGuard } from "@/components/auth/AuthGuard"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

function InsightsPage() {
  const router = useRouter()
  const { visions } = useVisions()
  const { dailyActions, completedActions, totalTimeSpent } = useDailyActions()
  const { victoryData, getVictoryStats, getRecentVictories } = useVictory()
  const victories = getRecentVictories(30)
  const victoryStats = getVictoryStats()

  const totalDaysActive = victoryStats.totalDays
  const totalActionsCompleted = Math.round(victoryStats.averageActionsPerDay * victoryStats.totalDays)
  const averageActionsPerDay = Math.round(victoryStats.averageActionsPerDay)
  const averageTimePerDay = victories.length > 0 ? Math.round(victories.reduce((sum: number, v: any) => sum + (v.timeSpent / 60), 0) / victories.length) : 0

  // Calculate completion rate over last 7 days
  const recentVictories = victories.slice(0, 7)
  const completionRate = Math.round(victoryStats.completionRate)

  // Insights and recommendations
  const insights = React.useMemo(() => {
    const insights = []
    
    if (completionRate >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Consistency!',
        description: `You're completing ${completionRate}% of your daily actions. Keep up the amazing work!`,
        icon: Award,
        color: 'text-green-400'
      })
    } else if (completionRate >= 60) {
      insights.push({
        type: 'info',
        title: 'Good Progress',
        description: `You're completing ${completionRate}% of actions. Try focusing on your highest priority tasks first.`,
        icon: TrendingUp,
        color: 'text-blue-400'
      })
    } else if (completionRate > 0) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        description: `Your completion rate is ${completionRate}%. Consider reducing your daily actions or adjusting time allocations.`,
        icon: Target,
        color: 'text-yellow-400'
      })
    }

    if (averageTimePerDay > 0) {
      insights.push({
        type: 'info',
        title: 'Time Investment',
        description: `You're investing an average of ${averageTimePerDay} minutes per day in your transformation.`,
        icon: Clock,
        color: 'text-[#a50cf2]'
      })
    }

    if (visions.length >= 3) {
      insights.push({
        type: 'tip',
        title: 'Vision Focus',
        description: `With ${visions.length} active visions, consider prioritizing 2-3 key areas for better focus.`,
        icon: Brain,
        color: 'text-purple-400'
      })
    }

    return insights
  }, [completionRate, averageTimePerDay, visions.length])

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            AI Insights
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="px-4 py-6">
          <h2 className="text-white text-xl font-bold mb-6">Your Progress</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={20} className="text-[#a50cf2]" />
                <span className="text-[#a50cf2] text-2xl font-bold">{totalDaysActive}</span>
              </div>
              <h3 className="text-white font-medium">Days Active</h3>
              <p className="text-[#b790cb] text-sm">Total journey days</p>
            </div>

            <div className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Target size={20} className="text-[#a50cf2]" />
                <span className="text-[#a50cf2] text-2xl font-bold">{totalActionsCompleted}</span>
              </div>
              <h3 className="text-white font-medium">Actions Completed</h3>
              <p className="text-[#b790cb] text-sm">Total achievements</p>
            </div>

            <div className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-[#a50cf2]" />
                <span className="text-[#a50cf2] text-2xl font-bold">{completionRate}%</span>
              </div>
              <h3 className="text-white font-medium">Completion Rate</h3>
              <p className="text-[#b790cb] text-sm">Last 7 days average</p>
            </div>

            <div className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock size={20} className="text-[#a50cf2]" />
                <span className="text-[#a50cf2] text-2xl font-bold">{averageTimePerDay}</span>
              </div>
              <h3 className="text-white font-medium">Avg Minutes/Day</h3>
              <p className="text-[#b790cb] text-sm">Daily time investment</p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Brain size={20} className="text-[#a50cf2]" />
              AI Insights & Recommendations
            </h3>
            
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = insight.icon
                  return (
                    <div key={index} className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-full", insight.color.replace('text-', 'bg-').replace('400', '400/20'))}>
                          <Icon size={20} className={insight.color} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                          <p className="text-[#b790cb] text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain size={48} className="text-[#b790cb] mx-auto mb-4 opacity-50" />
                <p className="text-[#b790cb] text-sm">
                  Complete a few daily actions to start receiving personalized insights!
                </p>
              </div>
            )}
          </div>

          {/* Vision Breakdown */}
          {visions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-4">Vision Focus Breakdown</h3>
              <div className="space-y-3">
                {visions.map((vision) => {
                  const visionActions = dailyActions.filter(action => action.visionId === vision.id)
                  const visionCompleted = visionActions.filter(action => action.completed).length
                  const visionProgress = visionActions.length > 0 ? Math.round((visionCompleted / visionActions.length) * 100) : 0
                  
                  return (
                    <div key={vision.id} className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium capitalize">
                          {vision.category.replace('-', ' ')}
                        </h4>
                        <span className="text-[#a50cf2] font-bold">{visionProgress}%</span>
                      </div>
                      
                      <div className="w-full bg-[#563168] rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-[#a50cf2] to-[#563168] h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${visionProgress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b790cb]">
                          {visionCompleted} of {visionActions.length} actions
                        </span>
                        <span className="text-[#b790cb]">
                          {vision.timeAllocation} min allocated
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Progress Trend */}
          {victories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-4">Recent Trend</h3>
              <div className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">Last 7 Days</span>
                  <TrendingUp size={20} className="text-[#a50cf2]" />
                </div>
                
                <div className="space-y-2">
                  {victories.slice(0, 7).map((victory: any, index: number) => (
                    <div key={victory.date} className="flex items-center justify-between">
                      <span className="text-[#b790cb] text-sm">Day {victory.dayNumber}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#563168] rounded-full h-1">
                          <div 
                            className="bg-[#a50cf2] h-1 rounded-full" 
                            style={{ width: `${(victory.actionsCompleted / victory.totalActions) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium">
                          {Math.round((victory.actionsCompleted / victory.totalActions) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <AccessibleBottomNavigation />
    </div>
  )
}

export default function InsightsPageWithAuth() {
  return (
    <AuthGuard>
      <InsightsPage />
    </AuthGuard>
  )
}
