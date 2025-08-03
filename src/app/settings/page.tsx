"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Bell, Palette, Database, Info, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { AuthGuard } from "@/components/auth/AuthGuard"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

interface UserSettings {
  notifications: {
    dailyReminders: boolean
    completionCelebrations: boolean
    weeklyReports: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'system'
    reducedMotion: boolean
    highContrast: boolean
  }
  privacy: {
    dataSharing: boolean
    analytics: boolean
  }
  account: {
    name: string
    email: string
  }
}

const defaultSettings: UserSettings = {
  notifications: {
    dailyReminders: true,
    completionCelebrations: true,
    weeklyReports: true
  },
  display: {
    theme: 'system',
    reducedMotion: false,
    highContrast: false
  },
  privacy: {
    dataSharing: false,
    analytics: false
  },
  account: {
    name: '',
    email: ''
  }
}

function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useLocalStorage<UserSettings>('user-settings', defaultSettings)
  const [showDataExport, setShowDataExport] = React.useState(false)

  const handleBack = () => {
    router.back()
  }

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current = newSettings as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      return newSettings
    })
  }

  const exportUserData = async () => {
    if (typeof window === 'undefined') return
    
    try {
      const userData = {
        visions: JSON.parse(localStorage.getItem('user-visions') || '[]'),
        actions: JSON.parse(localStorage.getItem('daily-actions') || '[]'),
        timeBudget: JSON.parse(localStorage.getItem('user-time-budget') || '{}'),
        victories: JSON.parse(localStorage.getItem('user-victories') || '[]'),
        settings: settings,
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
      
      setShowDataExport(false)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const clearAllData = () => {
    if (typeof window === 'undefined') return
    
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      const keys = ['user-visions', 'daily-actions', 'user-time-budget', 'user-victories', 'user-settings']
      keys.forEach(key => localStorage.removeItem(key))
      alert('All data has been cleared.')
      router.push('/dashboard')
    }
  }

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-between">
          <button 
            onClick={handleBack}
            className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Settings
          </h1>
        </div>

        {/* Settings Sections */}
        <div className="px-4 py-2 space-y-6">
          
          {/* Account Section */}
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <User size={20} />
              Account
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[#b790cb] text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settings.account.name}
                  onChange={(e) => updateSetting('account.name', e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-[#2b1834] border border-[#3c2249] rounded-lg text-white placeholder-[#b790cb] focus:border-[#a50cf2] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#b790cb] text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.account.email}
                  onChange={(e) => updateSetting('account.email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-[#2b1834] border border-[#3c2249] rounded-lg text-white placeholder-[#b790cb] focus:border-[#a50cf2] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </h2>
            <div className="space-y-3">
              <SettingToggle
                label="Daily Reminders"
                description="Get reminded to complete your daily actions"
                checked={settings.notifications.dailyReminders}
                onChange={(checked) => updateSetting('notifications.dailyReminders', checked)}
              />
              <SettingToggle
                label="Completion Celebrations"
                description="Celebrate when you complete all daily actions"
                checked={settings.notifications.completionCelebrations}
                onChange={(checked) => updateSetting('notifications.completionCelebrations', checked)}
              />
              <SettingToggle
                label="Weekly Reports"
                description="Receive weekly progress summaries"
                checked={settings.notifications.weeklyReports}
                onChange={(checked) => updateSetting('notifications.weeklyReports', checked)}
              />
            </div>
          </section>

          {/* Display Section */}
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Palette size={20} />
              Display
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[#b790cb] text-sm font-medium mb-2">
                  Theme
                </label>
                <select
                  value={settings.display.theme}
                  onChange={(e) => updateSetting('display.theme', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b1834] border border-[#3c2249] rounded-lg text-white focus:border-[#a50cf2] focus:outline-none"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <SettingToggle
                label="Reduced Motion"
                description="Minimize animations and transitions"
                checked={settings.display.reducedMotion}
                onChange={(checked) => updateSetting('display.reducedMotion', checked)}
              />
              <SettingToggle
                label="High Contrast"
                description="Increase contrast for better visibility"
                checked={settings.display.highContrast}
                onChange={(checked) => updateSetting('display.highContrast', checked)}
              />
            </div>
          </section>

          {/* Privacy Section */}
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Info size={20} />
              Privacy
            </h2>
            <div className="space-y-3">
              <SettingToggle
                label="Data Sharing"
                description="Allow anonymous usage data to improve the app"
                checked={settings.privacy.dataSharing}
                onChange={(checked) => updateSetting('privacy.dataSharing', checked)}
              />
              <SettingToggle
                label="Analytics"
                description="Help us understand how you use the app"
                checked={settings.privacy.analytics}
                onChange={(checked) => updateSetting('privacy.analytics', checked)}
              />
            </div>
          </section>

          {/* Data Management Section */}
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Database size={20} />
              Data Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataExport(true)}
                className="w-full px-4 py-3 bg-[#2b1834] border border-[#3c2249] rounded-lg text-white text-left hover:bg-[#3c2249] transition-colors"
              >
                Export My Data
              </button>
              <button
                onClick={clearAllData}
                className="w-full px-4 py-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-left hover:bg-red-900/30 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </section>
        </div>

        {/* Data Export Modal */}
        {showDataExport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b1834] rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-white text-lg font-bold mb-4">Export Your Data</h3>
              <p className="text-[#b790cb] text-sm mb-6">
                This will download a JSON file containing all your visions, actions, time budgets, and settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={exportUserData}
                  className="flex-1 px-4 py-2 bg-[#a50cf2] text-white rounded-lg hover:bg-[#9305d9] transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={() => setShowDataExport(false)}
                  className="flex-1 px-4 py-2 border border-[#3c2249] text-[#b790cb] rounded-lg hover:bg-[#3c2249] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <AccessibleBottomNavigation />
    </div>
  )
}

interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-white text-base font-medium">{label}</h3>
        <p className="text-[#b790cb] text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:ring-offset-2 focus:ring-offset-[#1d1023]",
          checked ? "bg-[#a50cf2]" : "bg-[#3c2249]"
        )}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}

export default function SettingsPageWithAuth() {
  return (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  )
}