"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Download, BarChart3, Target, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useVisions } from "@/hooks/useVisions"
import { useVictory } from "@/hooks/useVictory"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

interface UserSettings {
  account: {
    name: string
    email: string
  }
}

const defaultSettings = {
  account: {
    name: '',
    email: ''
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [settings] = useLocalStorage<UserSettings>('user-settings', defaultSettings)
  const { visions } = useVisions()
  const { victoryData, getVictoryStats, getRecentVictories } = useVictory()
  const victories = getRecentVictories(3)
  const victoryStats = getVictoryStats()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const totalDaysActive = victoryStats.totalDays
  const totalActionsCompleted = Math.round(victoryStats.averageActionsPerDay * victoryStats.totalDays)
  const activeVisions = visions.length

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Profile
          </h1>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#a50cf2] to-[#563168] rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-white text-xl font-bold mb-1">
              {settings.account.name || 'Future You'}
            </h2>
            {settings.account.email && (
              <p className="text-[#b790cb] text-sm">{settings.account.email}</p>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
              <div className="w-8 h-8 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock size={16} className="text-[#a50cf2]" />
              </div>
              <p className="text-white text-lg font-bold">{totalDaysActive}</p>
              <p className="text-[#b790cb] text-xs">Days Active</p>
            </div>
            <div className="text-center p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
              <div className="w-8 h-8 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 size={16} className="text-[#a50cf2]" />
              </div>
              <p className="text-white text-lg font-bold">{totalActionsCompleted}</p>
              <p className="text-[#b790cb] text-xs">Actions Done</p>
            </div>
            <div className="text-center p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
              <div className="w-8 h-8 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target size={16} className="text-[#a50cf2]" />
              </div>
              <p className="text-white text-lg font-bold">{activeVisions}</p>
              <p className="text-[#b790cb] text-xs">Active Visions</p>
            </div>
          </div>

          {/* Recent Achievements */}
          {victories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white text-lg font-bold mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {victories.slice(0, 3).map((victory: any) => (
                  <div key={victory.date} className="p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Day {victory.dayNumber} Complete!</p>
                        <p className="text-[#b790cb] text-sm">
                          {victory.actionsCompleted}/{victory.totalActions} actions • {Math.round(victory.timeSpent / 60)} min
                        </p>
                      </div>
                      <div className="text-2xl">🎉</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center justify-between p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-[#a50cf2]" />
                <span className="text-white font-medium">Settings</span>
              </div>
              <span className="text-[#b790cb] text-sm">→</span>
            </button>

            <button
              onClick={() => {
                // Export data functionality (same as in settings)
                if (typeof window === 'undefined') return
                
                try {
                  const userData = {
                    visions: JSON.parse(localStorage.getItem('user-visions') || '[]'),
                    actions: JSON.parse(localStorage.getItem('daily-actions') || '[]'),
                    timeBudget: JSON.parse(localStorage.getItem('user-time-budget') || '{}'),
                    victories: JSON.parse(localStorage.getItem('user-victories') || '[]'),
                    settings: JSON.parse(localStorage.getItem('user-settings') || '{}'),
                    exportedAt: new Date().toISOString()
                  }
                  
                  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `futureme-data-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Failed to export data:', error)
                  alert('Failed to export data. Please try again.')
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-[#a50cf2]" />
                <span className="text-white font-medium">Export My Data</span>
              </div>
              <span className="text-[#b790cb] text-sm">→</span>
            </button>
          </div>

          {/* App Version */}
          <div className="mt-8 text-center">
            <p className="text-[#b790cb] text-xs">
              FutureSync v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <AccessibleBottomNavigation />
    </div>
  )
}