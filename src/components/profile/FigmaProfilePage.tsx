"use client"

import * as React from "react"
import { Settings, User, Bell, House, List, BarChart3, Users, Flag, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVictory } from "@/hooks/useVictory"
import { useVisions } from "@/hooks/useVisions"
import { cn } from "@/lib/utils"

interface FigmaProfilePageProps {
  onSettings?: () => void
}

// Mock achievement badges - in real app these would come from user data
const achievementBadges = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB5C61DF2TbgbAA07V2qpKRMTKIWR-wbt3xGM0DA_Z_ZeRSpmL_rymTYCkVQ9_-w2AUDsherJzpBzNs3X_xcUy-crLtcxenAJk_RRt8wZiLJaXmirsIvkKasHpDFRBoMLY44lba-5Vbae8VyryZ8YRT-qGR_kDHpw7zP13dmh1BKxuBGAZX7EVhTKoJgyE0jVrn-Sd8f6LlyoyreffOniXjNmZzpuWXZLregx8uRx6W2VMFTK3gW4a1YNvTDn-sav8wRMtpgNUw_Tz-",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBUwMV_8omCjwWingTKM_Q07I21_YcRoFL8BJmyaDaTJs_6Ol6raLq4cR8LVwS1n288BOwj1mpDNCTm-96vI8Yd3X4uwGp70_jlSFRWicjrk7iONtzm4vgefwl2TIISR_y7YFOMAMtqyrV9pkvHM5Mnu6-Y0_jU3X_zp0AI7ZdXQCnt4Ufe-hsjhn8n5RwkeptIG3Q88rtIUl2eySxaclJjZB-cTGtgxTrolgnNwfUv902___feqpRGP610ZmJ19TvlCSfYagXH7Xpq",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTzykszk2VvsPA9k7GidfjPYOHXHnEbjSI2aPvTt-HmMmWETIgUycCfsfWlG0Yy6WktV_Mjy9g9pl8KAX12LYDUJKMRjhC74tBF6jgutwU-tNA2hlZ_uu1xXQk5LBkK2m_ie4HPFDRgZIqBflXrCGFCrd9AmxuGGsb14WhOo1iXGTa7We5pyvv0JLhihkgvyLecSLPwzj7oxXX6DJ6BY6M7iWwjeBpwznj1oVqpQHcVkHFRVL6yg4aq581CjOGLiltd-HLK9FzkpxM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDyPOBPI--8bOCI3dhSUaZUdwm_j3jbUmuPf2lP0EeJrFoTeXpuKBKv40fYycA3zbaLOL4D3Vo3ZFdYkEnbVzGi6hFq0NjMKJrYXEYbJWfp_oL1eiDhnXeK8wfniYaoLkLLo_GoizYVVPAbP5kka6f8M0-iPotQffSqp6pnDDwhzYJZqvPeO4c21y0n-MgukAvSeN6j86kl8zzPO-4SCHaoVRx9qzq8RdZHOysZFqaspkiWh9QZJrZ0HSNXuJmgRWhivcRpOCqwA96y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-eiHgd-vnQ7UXGn08MYVF_HVlxd4VFRYeC2IY4-CcxBBlnUS9hg47J7uagUdsqWfyHTyyMh3NdAGXGHB5C0gDhQVOY35ZmvOBELqYLJx1AHhjdLVGFr3sKgkP0cidC7NfKVxx6EF2oLRAWTJAX0dU9LwFeyFYGl8l1C-OG5HROexl4nYN_kRq8qInBb78M9JvjdP7hYzJz_8WPXDByL_UHGiJfx9MlI6cci8ST4s26-HlsbKXjKHHcbAK-fzjYwsdO0LNDUUFNduD",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC7U9a56YmZNCeYQSUlIpTizCBaxg1UOnDogCvckDxGu4cclystz1s1ZXZIcnREbCcCH0BWxLYEjLG8q2UJT4hawUmq8mxvh8W8ubT5PpBduSNecSysnsE0nbtEEYxSx0cBIwUPQPaP5pfwt3pYYOOZtCyJPYW7VLZ8eY5ZtHR7TZah36-hVNf8I_yJJQOjdYZqb04xnrZ6D3_k1dAlCvUcSGrtVkTY-f4gue0v4qZfMnWUwLSpaudQNFUo-u4TELJUPom1PLfgLlyl"
]

const userProfileImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBDbQ7SGG1n6tH9uOXiJrFMSXhGiYt3iBIDhz6EYzdF0FvwkIMCGa8qkSVw6vDXbvZ1ENQ5y_tKm7mV79XDLRjjZewdCStEE9el5Mz2otfkdttDfUXu_rnydqMDS-0XFhcH9JzIZGNOz9_HSlCLj2cRNeiLlQym0Fn0py23OxfVryMdCu0aK8z3-_Cxa_n20w8upWChWzSX_WoYj5fOB3JaOHRCe6VsgmNLgolNIL9TQgoAk7fQ5_bU47_0Mj3DFljx6OLWZehmL6dO"

interface Goal {
  id: string
  title: string
  status: 'In Progress' | 'Completed'
  icon: React.ReactNode
}

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Learn a new language",
    status: "In Progress",
    icon: <Flag size={24} />
  },
  {
    id: "2", 
    title: "Run a marathon",
    status: "Completed",
    icon: <Trophy size={24} />
  }
]

export default function FigmaProfilePage({ onSettings }: FigmaProfilePageProps) {
  const router = useRouter()
  const { getVictoryStats } = useVictory()
  const { visions } = useVisions()
  
  // Get real stats from user data
  const victoryStats = getVictoryStats()
  const overallProgress = victoryStats.totalDays > 0 ? Math.round((victoryStats.currentStreak / victoryStats.totalDays) * 100) : 75
  const activeGoals = visions.length || 3

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

  const handleSettingsItem = (item: string) => {
    console.log(`Open ${item} settings`)
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
            Profile
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

        {/* Profile Section */}
        <div className="flex p-4">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                style={{ backgroundImage: `url("${userProfileImage}")` }}
              />
              <div className="flex flex-col items-center justify-center">
                <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                  Ethan Carter
                </p>
                <p className="text-[#b690cb] text-base font-normal leading-normal text-center">
                  AI-powered life transformation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-3 px-4 py-3">
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#553168] p-3 items-center text-center">
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {overallProgress}%
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#b690cb] text-sm font-normal leading-normal">Overall Progress</p>
            </div>
          </div>
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#553168] p-3 items-center text-center">
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {achievementBadges.length}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#b690cb] text-sm font-normal leading-normal">Achievements</p>
            </div>
          </div>
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#553168] p-3 items-center text-center">
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {activeGoals}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#b690cb] text-sm font-normal leading-normal">Active Goals</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Settings
        </h2>
        
        <button
          onClick={() => handleSettingsItem('Account Settings')}
          className="flex items-center gap-4 bg-[#1c1023] px-4 min-h-14 w-full hover:bg-white/5 transition-colors duration-200"
        >
          <div className="text-white flex items-center justify-center rounded-lg bg-[#3b2249] shrink-0 size-10">
            <User size={24} />
          </div>
          <p className="text-white text-base font-normal leading-normal flex-1 truncate text-left">
            Account Settings
          </p>
        </button>
        
        <button
          onClick={() => handleSettingsItem('Notifications')}
          className="flex items-center gap-4 bg-[#1c1023] px-4 min-h-14 w-full hover:bg-white/5 transition-colors duration-200"
        >
          <div className="text-white flex items-center justify-center rounded-lg bg-[#3b2249] shrink-0 size-10">
            <Bell size={24} />
          </div>
          <p className="text-white text-base font-normal leading-normal flex-1 truncate text-left">
            Notifications
          </p>
        </button>
        
        <button
          onClick={() => handleSettingsItem('App Preferences')}
          className="flex items-center gap-4 bg-[#1c1023] px-4 min-h-14 w-full hover:bg-white/5 transition-colors duration-200"
        >
          <div className="text-white flex items-center justify-center rounded-lg bg-[#3b2249] shrink-0 size-10">
            <Settings size={24} />
          </div>
          <p className="text-white text-base font-normal leading-normal flex-1 truncate text-left">
            App Preferences
          </p>
        </button>

        {/* Achievements Section */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Achievements
        </h2>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {achievementBadges.map((badge, index) => (
            <div key={index} className="flex flex-col gap-3 text-center">
              <div className="px-4">
                <div
                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full hover:scale-105 transition-transform duration-200 cursor-pointer"
                  style={{ backgroundImage: `url("${badge}")` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Goals Section */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Goals
        </h2>
        
        {mockGoals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-4 bg-[#1c1023] px-4 min-h-[72px] py-2">
            <div className="text-white flex items-center justify-center rounded-lg bg-[#3b2249] shrink-0 size-12">
              {goal.icon}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-white text-base font-medium leading-normal line-clamp-1">
                {goal.title}
              </p>
              <p className={cn(
                "text-sm font-normal leading-normal line-clamp-2",
                goal.status === "Completed" ? "text-green-400" : "text-[#b690cb]"
              )}>
                {goal.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#3b2249] bg-[#2a1834] px-4 pb-3 pt-2">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b690cb]"
          >
            <div className="text-[#b690cb] flex h-8 items-center justify-center">
              <House size={24} />
            </div>
            <p className="text-[#b690cb] text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
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
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <div className="text-white flex h-8 items-center justify-center">
              <User size={24} fill="currentColor" />
            </div>
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
        </div>
        <div className="h-5 bg-[#2a1834]" />
      </div>
    </div>
  )
}