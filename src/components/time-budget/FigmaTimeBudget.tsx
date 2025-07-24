"use client"

import * as React from "react"
import { ArrowLeft, House, List, BarChart3, Users, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVisions } from "@/hooks/useVisions"
import { useTimeBudget } from "@/hooks/useTimeBudget"
import { minutesToHoursMinutes } from "@/utils/timeUtils"
import { cn } from "@/lib/utils"

interface FigmaTimeBudgetProps {
  onBack?: () => void
  onComplete?: () => void
}

const visionImages = {
  health: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTqwTjOtxmfAMMCj9UaPh9FDBGEMSD3nRLLy-ZoiLoGJBLxywwVC5eziOb0vCh2Lj8mYLouDlMKmchr8F4QFK9Ls24ijIRCINbXRH9mIo1f6RCri5KD-jciOKjtq75M6RbnnCiTxylK5pjQkynU_QE1d7KaWkymHkivoNKCLprdafL38FI6PfzxoVCAlwk-Uu1LCD_nvfbi6L8D9apHkoEX7qI-ydtJ0SbBfhqvsO-ecfPnWtU_Vy6XNx_yNTHWj5QP3f_L6mV8lHD",
  career: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVBOo-Z8TLZFViANgHElCq0ueBcwYJdVQt4tMsvBBGkvIXVCnDtST5zhHQej1IGRGbYwihgZXrygu8SVqp7Hu3J5TlKdgnYUejINeN1B1XlltGFlp74Mdog4a3zEJSvbHF_A6p8rl8uJ1z7UNSrlZuG0p0hOW4bqWmLGN7TRGTnOhZwLWfkPSDBdUjcT6USX69jcGzyxyF4Rk5gfAmH-S4CeoLwkk97iw21EAA0nsbIDa1OS8qtxSoGsURTyO_Sw9r6YGHLXuPnf7y",
  relationships: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQCVuqrJC0uDjgXEJtWkjcL0zfadfv0AXoz-FPDikKTLCfWWsGX9J--LYI2wwLWsQ8mk5uQluxBJ7QNfbnOZHrN6wQiaNl_Afk5lVB0pWHM-erU31e5fa0OULz0-jkoe0c3x471gksUZcuXnsmT6hQjlURRCuxJxcA_RyICpGMzcPURF6JMayuYhXxJrNXcCw0h_t2jDnYTyDx8GBVEgGT3miEAkkWfolbIBkRIYHh2ujEnHh6HJUDf_OqPtxtCc6n3d_tCPvVeD1",
  "personal-growth": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQCVuqrJC0uDjgXEJtWkjcL0zfadfv0AXoz-FPDikKTLCfWWsGX9J--LYI2wwLWsQ8mk5uQluxBJ7QNfbnOZHrN6wQiaNl_Afk5lVB0pWHM-erU31e5fa0OULz0-jkoe0c3x471gksUZcuXnsmT6hQjlURRCuxJxcA_RyICpGMzcPURF6JMayuYhXxJrNXcCw0h_t2jDnYTyDx8GBVEgGT3miEAkkWfolbIBkRIYHh2ujEnHh6HJUDf_OqPtxtCc6n3d_tCPvVeD1"
}

const visionTitles = {
  health: "Marathon Runner",
  career: "Entrepreneur", 
  relationships: "Family",
  "personal-growth": "Growth Seeker"
}

const visionDescriptions = {
  health: "Allocate time for your fitness goals.",
  career: "Allocate time for your business ventures.",
  relationships: "Allocate time for quality family moments.", 
  "personal-growth": "Allocate time for personal development."
}

export default function FigmaTimeBudget({ onBack, onComplete }: FigmaTimeBudgetProps) {
  const router = useRouter()
  const { visions } = useVisions()
  const { 
    totalAvailableTime, 
    allocations, 
    totalAllocated, 
    remainingTime, 
    isFullyAllocated 
  } = useTimeBudget()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const progressPercentage = totalAvailableTime > 0 ? (totalAllocated / totalAvailableTime) * 100 : 0

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
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Time Budget
          </h2>
        </div>

        {/* Budget Header */}
        <h3 className="text-white tracking-tight text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
          Today's Time Budget: {minutesToHoursMinutes(totalAvailableTime)}
        </h3>

        {/* Progress Section */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-6 justify-end">
            <p className="text-white text-sm font-normal leading-normal">
              {minutesToHoursMinutes(totalAllocated)} / {minutesToHoursMinutes(totalAvailableTime)}
            </p>
          </div>
          <div className="rounded bg-[#563168]">
            <div 
              className="h-2 rounded bg-[#a50cf2] transition-all duration-500" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Vision Allocation Header */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Vision Allocation
        </h3>

        {/* Vision Cards */}
        {visions.map((vision) => {
          const allocatedTime = allocations[vision.id] || 0
          const visionTitle = visionTitles[vision.category] || vision.category
          const visionDesc = visionDescriptions[vision.category] || "Allocate time for this vision."
          const visionImage = visionImages[vision.category] || visionImages.health

          return (
            <div key={vision.id} className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#b790cb] text-sm font-normal leading-normal">
                    {visionTitle}
                  </p>
                  <p className="text-white text-base font-bold leading-tight">
                    {minutesToHoursMinutes(allocatedTime)}
                  </p>
                  <p className="text-[#b790cb] text-sm font-normal leading-normal">
                    {visionDesc}
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{ backgroundImage: `url("${visionImage}")` }}
                />
              </div>
            </div>
          )
        })}

        {/* Summary Section */}
        <div className="p-4">
          <div className="flex justify-between gap-x-6 py-2">
            <p className="text-[#b790cb] text-sm font-normal leading-normal">Assigned</p>
            <p className="text-white text-sm font-normal leading-normal text-right">
              {minutesToHoursMinutes(totalAllocated)}
            </p>
          </div>
          <div className="flex justify-between gap-x-6 py-2">
            <p className="text-[#b790cb] text-sm font-normal leading-normal">Remaining</p>
            <p className="text-white text-sm font-normal leading-normal text-right">
              {minutesToHoursMinutes(Math.max(0, remainingTime))}
            </p>
          </div>
        </div>

        {/* Action Text */}
        {!isFullyAllocated && (
          <p className="text-[#b790cb] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Assign All Time
          </p>
        )}

        {isFullyAllocated && (
          <button
            onClick={onComplete}
            className="mx-4 mb-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#a50cf2] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#9305d9] transition-colors duration-200 active:scale-95 transform"
          >
            <span className="truncate">Continue to Actions</span>
          </button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#3c2249] bg-[#2b1834] px-4 pb-3 pt-2">
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
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <List size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Actions</p>
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