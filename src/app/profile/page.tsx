"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Download, BarChart3, Target, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useVisions } from "@/hooks/useVisions"
import { useVictory } from "@/hooks/useVictory"
import { AuthGuard } from "@/components/auth/AuthGuard"
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

function ProfilePage() {
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
          <div className="text-center mb-8 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#a50cf2] to-[#563168] rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-1">
              {settings.account.name || 'Ethan Carter'}
            </h2>
            <p className="text-[#b790cb] text-sm mb-4">AI-powered life transformation</p>
            
            {/* Settings Gear Icon */}
            <button
              onClick={() => handleNavigation('/settings')}
              className="absolute top-0 right-0 text-white flex size-10 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Enhanced Stats Section */}
          <div className="space-y-4 mb-8">
            {/* Overall Progress Card */}
            <div className="p-6 bg-[#2b1834] rounded-lg border border-[#3c2249]">
              <div className="text-center">
                <p className="text-[#b790cb] text-sm mb-2">Overall Progress</p>
                <p className="text-white text-4xl font-bold mb-2">75%</p>
                <div className="w-full bg-[#1d1023] rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#a50cf2] to-[#563168] h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
                <div className="w-10 h-10 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 size={20} className="text-[#a50cf2]" />
                </div>
                <p className="text-white text-2xl font-bold">12</p>
                <p className="text-[#b790cb] text-sm">Achievements</p>
              </div>
              <div className="text-center p-4 bg-[#2b1834] rounded-lg border border-[#3c2249]">
                <div className="w-10 h-10 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target size={20} className="text-[#a50cf2]" />
                </div>
                <p className="text-white text-2xl font-bold">{activeVisions}</p>
                <p className="text-[#b790cb] text-sm">Active Goals</p>
              </div>
            </div>
          </div>

          {/* Achievements Gallery */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-bold mb-4">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 1, icon: "🏃", color: "from-blue-500 to-cyan-500", earned: true, title: "First Steps" },
                { id: 2, icon: "🔥", color: "from-red-500 to-orange-500", earned: true, title: "7 Day Streak" },
                { id: 3, icon: "⭐", color: "from-yellow-500 to-amber-500", earned: true, title: "Goal Crusher" },
                { id: 4, icon: "💪", color: "from-purple-500 to-pink-500", earned: false, title: "Strength" },
                { id: 5, icon: "🎯", color: "from-green-500 to-emerald-500", earned: false, title: "Precision" },
                { id: 6, icon: "🚀", color: "from-indigo-500 to-purple-500", earned: false, title: "Launch" }
              ].map((achievement) => (
                <div key={achievement.id} className="aspect-square">
                  <div className={`w-full h-full rounded-full flex items-center justify-center border-2 ${
                    achievement.earned 
                      ? `bg-gradient-to-br ${achievement.color} border-white/20` 
                      : 'bg-[#2b1834] border-[#3c2249]'
                  }`}>
                    <span className={`text-2xl ${achievement.earned ? '' : 'opacity-30'}`}>
                      {achievement.icon}
                    </span>
                  </div>
                  <p className={`text-xs text-center mt-2 ${achievement.earned ? 'text-white' : 'text-[#b790cb]'}`}>
                    {achievement.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Section */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-bold mb-4">Goals</h3>
            <div className="space-y-3">
              <div className="p-4 bg-[#2b1834] rounded-lg border border-[#3c2249] flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Learn a new language</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">In Progress</span>
                    <span className="text-[#b790cb] text-xs">Daily Spanish practice</span>
                  </div>
                </div>
                <div className="text-blue-400">📚</div>
              </div>
              
              <div className="p-4 bg-[#2b1834] rounded-lg border border-[#3c2249] flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Run a marathon</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Completed</span>
                    <span className="text-[#b790cb] text-xs">26.2 miles achieved!</span>
                  </div>
                </div>
                <div className="text-green-400">🏃‍♂️</div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-bold mb-4">Settings</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation('/account')}
                className="w-full flex items-center justify-between p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User size={20} className="text-[#a50cf2]" />
                  <span className="text-white font-medium">Account Settings</span>
                </div>
                <span className="text-[#b790cb] text-sm">→</span>
              </button>

              <button
                onClick={() => alert('Notifications settings coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-[#a50cf2]">🔔</span>
                  </div>
                  <span className="text-white font-medium">Notifications</span>
                </div>
                <span className="text-[#b790cb] text-sm">→</span>
              </button>

              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full flex items-center justify-between p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg hover:bg-[#3c2249] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-[#a50cf2]" />
                  <span className="text-white font-medium">App Preferences</span>
                </div>
                <span className="text-[#b790cb] text-sm">→</span>
              </button>
            </div>
          </div>

          {/* Data Export Button */}
          <div className="space-y-3">
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

export default function ProfilePageWithAuth() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  )
}