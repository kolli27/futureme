"use client"

import * as React from "react"
import { Settings, House, List, BarChart3, Users, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVisions } from "@/hooks/useVisions"
import { useTimeBudget } from "@/hooks/useTimeBudget"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVictory } from "@/hooks/useVictory"
import { cn } from "@/lib/utils"

interface FigmaDashboardProps {
  onSettings?: () => void
}

// Vision images mapping
const visionImages = {
  health: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTqwTjOtxmfAMMCj9UaPh9FDBGEMSD3nRLLy-ZoiLoGJBLxywwVC5eziOb0vCh2Lj8mYLouDlMKmchr8F4QFK9Ls24ijIRCINbXRH9mIo1f6RCri5KD-jciOKjtq75M6RbnnCiTxylK5pjQkynU_QE1d7KaWkymHkivoNKCLprdafL38FI6PfzxoVCAlwk-Uu1LCD_nvfbi6L8D9apHkoEX7qI-ydtJ0SbBfhqvsO-ecfPnWtU_Vy6XNx_yNTHWj5QP3f_L6mV8lHD",
  career: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVBOo-Z8TLZFViANgHElCq0ueBcwYJdVQt4tMsvBBGkvIXVCnDtST5zhHQej1IGRGbYwihgZXrygu8SVqp7Hu3J5TlKdgnYUejINeN1B1XlltGFlp74Mdog4a3zEJSvbHF_A6p8rl8uJ1z7UNSrlZuG0p0hOW4bqWmLGN7TRGTnOhZwLWfkPSDBdUjcT6USX69jcGzyxyF4Rk5gfAmH-S4CeoLwkk97iw21EAA0nsbIDa1OS8qtxSoGsURTyO_Sw9r6YGHLXuPnf7y",
  relationships: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQCVuqrJC0uDjgXEJtWkjcL0zfadfv0AXoz-FPDikKTLCfWWsGX9J--LYI2wwLWsQ8mk5uQluxBJ7QNfbnOZHrN6wQiaNl_Afk5lVB0pWHM-erU31e5fa0OULz0-jkoe0c3x471gksUZcuXnsmT6hQjlURRCuxJxcA_RyICpGMzcPURF6JMayuYhXxJrNXcCw0h_t2jDnYTyDx8GBVEgGT3miEAkkWfolbIBkRIYHh2ujEnHh6HJUDf_OqPtxtCc6n3d_tCPvVeD1",
  'personal-growth': "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQCVuqrJC0uDjgXEJtWkjcL0zfadfv0AXoz-FPDikKTLCfWWsGX9J--LYI2wwLWsQ8mk5uQluxBJ7QNfbnOZHrN6wQiaNl_Afk5lVB0pWHM-erU31e5fa0OULz0-jkoe0c3x471gksUZcuXnsmT6hQjlURRCuxJxcA_RyICpGMzcPURF6JMayuYhXxJrNXcCw0h_t2jDnYTyDx8GBVEgGT3miEAkkWfolbIBkRIYHh2ujEnHh6HJUDf_OqPtxtCc6n3d_tCPvVeD1"
}

// Vision display names
const visionDisplayNames = {
  health: "Marathon Runner",
  career: "Entrepreneur", 
  relationships: "Family",
  'personal-growth': "Personal Growth"
}

export default function FigmaDashboard({ onSettings }: FigmaDashboardProps) {
  const router = useRouter()
  const { visions } = useVisions()
  const { allocations, totalAvailableTime } = useTimeBudget()
  const { totalActions, completedActions, totalTimeSpent } = useDailyActions()
  const { getVictoryStats } = useVictory()
  
  // Get real stats
  const victoryStats = getVictoryStats()
  const totalAllocated = Object.values(allocations).reduce((sum, time) => sum + time, 0)
  const progressPercentage = totalAvailableTime > 0 ? Math.round((totalTimeSpent / totalAvailableTime) * 100) : 0
  
  // Get current date
  const getCurrentDate = () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric'
    }
    return `Today is ${now.toLocaleDateString('en-US', options)}`
  }

  // Format time from minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleSettings = () => {
    if (onSettings) {
      onSettings()
    } else {
      console.log('Open settings')
    }
  }

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1c1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1c1023] p-4 pb-2 justify-between">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
            FutureSync
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button
              onClick={handleSettings}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/5 transition-colors duration-200"
            >
              <div className="text-white">
                <Settings size={24} />
              </div>
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <h3 className="text-white tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
          Good Morning, Ethan!
        </h3>
        <p className="text-[#b690cb] text-sm font-normal leading-normal pb-3 pt-1 px-4">
          {getCurrentDate()}
        </p>

        {/* Today's Progress */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Today's Progress
        </h3>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-6 justify-between">
            <p className="text-white text-base font-medium leading-normal">Daily Progress</p>
            <p className="text-white text-sm font-normal leading-normal">
              {formatTime(totalTimeSpent)} / {formatTime(totalAvailableTime)}
            </p>
          </div>
          <div className="rounded bg-[#553168]">
            <div 
              className="h-2 rounded bg-[#9e0bee]" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <p className="text-[#b690cb] text-sm font-normal leading-normal">
            Day {victoryStats.currentStreak} Streak!
          </p>
        </div>

        {/* Actions Completed Card */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#553168]">
            <p className="text-white text-base font-medium leading-normal">Actions Completed</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {completedActions.length}/{totalActions}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Quick Actions
        </h3>
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
            <button
              onClick={() => handleNavigation('/actions')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#9e0bee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#8a0bd1] transition-colors duration-200"
            >
              <span className="truncate">Continue Actions</span>
            </button>
            <button
              onClick={() => handleNavigation('/time-budget')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#3b2249] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#4a2d57] transition-colors duration-200"
            >
              <span className="truncate">Set Time Budget</span>
            </button>
            <button
              onClick={() => handleNavigation('/insights')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#3b2249] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#4a2d57] transition-colors duration-200"
            >
              <span className="truncate">View Insights</span>
            </button>
          </div>
        </div>

        {/* Vision Progress */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Vision Progress
        </h3>
        
        {visions.map((vision, index) => {
          const allocated = allocations[vision.id] || 0
          const spent = Math.floor(allocated * 0.7) // Mock time spent (70% of allocated)
          const displayName = visionDisplayNames[vision.category] || vision.category
          const imageUrl = visionImages[vision.category] || visionImages.health
          
          return (
            <div key={vision.id} className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#b690cb] text-sm font-normal leading-normal">
                    {displayName}
                  </p>
                  <p className="text-white text-base font-bold leading-tight">
                    {formatTime(allocated)}
                  </p>
                  <p className="text-[#b690cb] text-sm font-normal leading-normal">
                    Time spent today: {formatTime(spent)}
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                />
              </div>
            </div>
          )
        })}

        {/* Motivational Section */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Motivational
        </h3>
        <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
          You're making great progress, Ethan! Keep up the momentum and you'll reach your goals in no time. Your next milestone is just around the corner!
        </p>
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#3b2249] bg-[#2a1834] px-4 pb-3 pt-2">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <div className="text-white flex h-8 items-center justify-center">
              <House size={24} fill="currentColor" />
            </div>
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/actions')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b690cb]"
          >
            <div className="text-[#b690cb] flex h-8 items-center justify-center">
              <List size={24} />
            </div>
            <p className="text-[#b690cb] text-xs font-medium leading-normal tracking-[0.015em]">Actions</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/insights')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b690cb]"
          >
            <div className="text-[#b690cb] flex h-8 items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <p className="text-[#b690cb] text-xs font-medium leading-normal tracking-[0.015em]">Insights</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/community')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b690cb]"
          >
            <div className="text-[#b690cb] flex h-8 items-center justify-center">
              <Users size={24} />
            </div>
            <p className="text-[#b690cb] text-xs font-medium leading-normal tracking-[0.015em]">Community</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b690cb]"
          >
            <div className="text-[#b690cb] flex h-8 items-center justify-center">
              <User size={24} />
            </div>
            <p className="text-[#b690cb] text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
        </div>
        <div className="h-5 bg-[#2a1834]" />
      </div>
    </div>
  )
}