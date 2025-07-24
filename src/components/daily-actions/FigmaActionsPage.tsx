"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { List, House, BarChart3, Users, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVisions } from "@/hooks/useVisions"
import { useVictory } from "@/hooks/useVictory"
import { cn } from "@/lib/utils"

interface FigmaActionsPageProps {
  onAllActionsComplete?: () => void
}

export default function FigmaActionsPage({ onAllActionsComplete }: FigmaActionsPageProps) {
  const router = useRouter()
  const { visions } = useVisions()
  const {
    dailyActions,
    completedActions,
    totalActions,
    totalTimeSpent,
    allActionsComplete,
    toggleActionComplete,
    startTimer,
    getTimerState
  } = useDailyActions()
  const { recordVictory, getCurrentDayNumber } = useVictory()
  
  const [activeTimers, setActiveTimers] = useState<{ [actionId: string]: boolean }>({})

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }
    return now.toLocaleDateString('en-US', options)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleCheckboxChange = useCallback((actionId: string) => {
    toggleActionComplete(actionId)
    
    // Stop timer if running
    if (activeTimers[actionId]) {
      setActiveTimers(prev => ({ ...prev, [actionId]: false }))
    }
  }, [toggleActionComplete, activeTimers])

  const handleStartTimer = useCallback((actionId: string) => {
    startTimer(actionId)
    setActiveTimers(prev => ({ ...prev, [actionId]: true }))
    
    // For demo purposes, auto-stop timer after action estimated time
    const action = dailyActions.find(a => a.id === actionId)
    if (action) {
      setTimeout(() => {
        setActiveTimers(prev => ({ ...prev, [actionId]: false }))
        // Could auto-complete action here if desired
      }, action.estimatedTime * 60 * 1000)
    }
  }, [startTimer, dailyActions])

  // Check if all actions complete and trigger victory
  React.useEffect(() => {
    if (allActionsComplete && totalActions > 0) {
      // Record victory with stats
      recordVictory(completedActions.length, totalActions, totalTimeSpent)
      
      // Navigate to victory screen
      const dayNumber = getCurrentDayNumber()
      router.push(`/victory?day=${dayNumber}`)
      
      // Also trigger callback if provided
      if (onAllActionsComplete) {
        onAllActionsComplete()
      }
    }
  }, [allActionsComplete, totalActions, completedActions.length, totalTimeSpent, recordVictory, getCurrentDayNumber, router, onAllActionsComplete])

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ 
        fontFamily: 'Manrope, "Noto Sans", sans-serif',
        ['--checkbox-tick-svg' as any]: `url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')`
      } as React.CSSProperties}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-between">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
            Today's Focus
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
              <div className="text-white">
                <List size={24} />
              </div>
            </button>
          </div>
        </div>

        {/* Date */}
        <p className="text-[#b790cb] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          {getCurrentDate()}
        </p>

        {/* Actions List */}
        {dailyActions.length > 0 ? (
          dailyActions.map((action) => {
            const isCompleted = action.completed
            const isTimerActive = activeTimers[action.id] || false
            
            return (
              <div key={action.id}>
                {/* Action Item */}
                <div className="flex items-center gap-4 bg-[#1d1023] px-4 min-h-[72px] py-2">
                  <div className="flex size-7 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleCheckboxChange(action.id)}
                      className="h-5 w-5 rounded border-[#563168] border-2 bg-transparent text-[#a50cf2] checked:bg-[#a50cf2] checked:border-[#a50cf2] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#563168] focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className={cn(
                      "text-base font-medium leading-normal line-clamp-1",
                      isCompleted ? "text-[#b790cb] line-through" : "text-white"
                    )}>
                      {action.description}
                    </p>
                    <p className="text-[#b790cb] text-sm font-normal leading-normal line-clamp-2">
                      {action.estimatedTime}min
                    </p>
                  </div>
                </div>

                {/* Timer Button */}
                {!isCompleted && (
                  <div className="flex px-4 py-3 justify-center">
                    <button
                      onClick={() => handleStartTimer(action.id)}
                      disabled={isTimerActive}
                      className={cn(
                        "flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-200",
                        isTimerActive 
                          ? "bg-[#563168] text-[#b790cb] cursor-not-allowed"
                          : "bg-[#a50cf2] text-white hover:bg-[#9305d9] active:scale-95"
                      )}
                    >
                      <span className="truncate">
                        {isTimerActive ? "Timer Running..." : "Start Timer"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Completed State */}
                {isCompleted && (
                  <div className="flex px-4 py-3 justify-center">
                    <div className="flex items-center gap-2 text-[#a50cf2] text-sm font-medium">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/>
                      </svg>
                      <span>Completed!</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-[#b790cb] text-center">
              <List size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No actions for today</p>
              <p className="text-sm opacity-75">Complete your time budget to generate daily actions</p>
            </div>
          </div>
        )}

        {/* All Complete Message */}
        {allActionsComplete && dailyActions.length > 0 && (
          <div className="mx-4 mt-6 p-6 bg-gradient-to-r from-[#a50cf2]/20 to-[#563168]/20 rounded-xl border border-[#a50cf2]/30">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-white text-lg font-bold mb-2">Amazing Work!</h3>
              <p className="text-[#b790cb] text-sm">
                You've completed all your daily actions. Every step brings you closer to your transformation!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#3c2249] bg-[#2b1834] px-4 pb-3 pt-2">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <House size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/actions')}
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <div className="text-white flex h-8 items-center justify-center">
              <List size={24} fill="currentColor" />
            </div>
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Actions</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/insights')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Insights</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/community')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <Users size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Community</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <User size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
        </div>
        <div className="h-5 bg-[#2b1834]" />
      </div>
    </div>
  )
}