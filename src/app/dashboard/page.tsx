"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Target, Clock, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVisions } from "@/hooks/useVisions"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVictory } from "@/hooks/useVictory"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

export default function DashboardPage() {
  const router = useRouter()
  const { visions } = useVisions()
  const { dailyActions, completedActions, totalActions, allActionsComplete } = useDailyActions()
  const { victoryData, getCurrentDayNumber, getRecentVictories } = useVictory()
  const victories = getRecentVictories(5)

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const todayProgress = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0
  const currentDay = getCurrentDayNumber()

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Dashboard
          </h1>
        </div>

        {/* Welcome Section */}
        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-white text-2xl font-bold mb-2">
              Welcome Back!
            </h2>
            <p className="text-[#b790cb] text-base">
              Day {currentDay} of your transformation journey
            </p>
          </div>

          {/* Today's Progress */}
          <div className="bg-gradient-to-r from-[#a50cf2]/20 to-[#563168]/20 rounded-xl p-6 mb-6 border border-[#a50cf2]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Today's Progress</h3>
              <span className="text-[#a50cf2] text-2xl font-bold">{todayProgress}%</span>
            </div>
            
            <div className="w-full bg-[#563168] rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-[#a50cf2] to-[#563168] h-3 rounded-full transition-all duration-500" 
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-[#b790cb]">
                {completedActions.length} of {totalActions} actions complete
              </span>
              {allActionsComplete && (
                <span className="text-[#a50cf2] font-medium">🎉 All done!</span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleNavigation('/actions')}
              className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mb-3">
                <Target size={20} className="text-[#a50cf2]" />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">Daily Actions</h4>
              <p className="text-[#b790cb] text-xs">Complete your tasks</p>
            </button>

            <button
              onClick={() => handleNavigation('/time-budget')}
              className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mb-3">
                <Clock size={20} className="text-[#a50cf2]" />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">Time Budget</h4>
              <p className="text-[#b790cb] text-xs">Plan your day</p>
            </button>
          </div>

          {/* Active Visions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Your Visions</h3>
              <button
                onClick={() => handleNavigation('/onboarding')}
                className="text-[#a50cf2] text-sm font-medium hover:text-[#9305d9]"
              >
                <Plus size={16} className="inline mr-1" />
                Add Vision
              </button>
            </div>
            
            {visions.length > 0 ? (
              <div className="space-y-3">
                {visions.slice(0, 3).map((vision) => (
                  <div key={vision.id} className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium capitalize mb-1">
                          {vision.category.replace('-', ' ')}
                        </h4>
                        <p className="text-[#b790cb] text-sm line-clamp-2">
                          {vision.description}
                        </p>
                      </div>
                      <div className="text-[#a50cf2] font-bold text-sm">
                        {vision.timeAllocation}min
                      </div>
                    </div>
                  </div>
                ))}
                
                {visions.length > 3 && (
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full p-3 border border-[#3c2249] border-dashed rounded-lg text-[#b790cb] text-sm hover:border-[#a50cf2] hover:text-[#a50cf2] transition-colors"
                  >
                    View all {visions.length} visions
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#563168]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target size={24} className="text-[#b790cb]" />
                </div>
                <h4 className="text-white font-medium mb-2">No visions yet</h4>
                <p className="text-[#b790cb] text-sm mb-4">
                  Create your first vision to start your transformation journey
                </p>
                <button
                  onClick={() => handleNavigation('/onboarding')}
                  className="px-6 py-2 bg-[#a50cf2] text-white rounded-lg hover:bg-[#9305d9] transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          {victories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {victories.slice(0, 2).map((victory) => (
                  <div key={victory.date} className="p-4 bg-gradient-to-r from-green-900/20 to-[#a50cf2]/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Day {victory.dayNumber} Complete! 🎉</h4>
                        <p className="text-[#b790cb] text-sm">
                          {victory.actionsCompleted} actions completed in {Math.round(victory.timeSpent / 60)} minutes
                        </p>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                  </div>
                ))}
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