"use client"

import * as React from "react"
import { ArrowLeft, House, Search, FileText, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FigmaVictoryScreenProps {
  dayNumber?: number
  onContinue?: () => void
  onShare?: () => void
  onBack?: () => void
}

const victoryImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2Gzyey7W6Fh0x6JG-YQdzrNdPdVOccyI0tpPxYB85t4dGPh8COXK6LOqRng7-Dsha3o0909UBuzLglX-gndLCJk1XgYGdo3SswaNG8rscYCSMI9NZvlZbOzQjrOsUVGMGBCokyCPm9gR0Rx8gETCEjaJLE3d3ZxSlUItp5zBT2rCO91u_DEM16350ayFMFWy_N_JAMskQpGBNkG45vgJcHX5K1mZpgJkA9Zp2SexDBvrUKYMlA5K8GM-yDZcVOn1FXHMUcqUzrtq8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVBOo-Z8TLZFViANgHElCq0ueBcwYJdVQt4tMsvBBGkvIXVCnDtST5zhHQej1IGRGbYwihgZXrygu8SVqp7Hu3J5TlKdgnYUejINeN1B1XlltGFlp74Mdog4a3zEJSvbHF_A6p8rl8uJ1z7UNSrlZuG0p0hOW4bqWmLGN7TRGTnOhZwLWfkPSDBdUjcT6USX69jcGzyxyF4Rk5gfAmH-S4CeoLwkk97iw21EAA0nsbIDa1OS8qtxSoGsURTyO_Sw9r6YGHLXuPnf7y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQCVuqrJC0uDjgXEJtWkjcL0zfadfv0AXoz-FPDikKTLCfWWsGX9J--LYI2wwLWsQ8mk5uQluxBJ7QNfbnOZHrN6wQiaNl_Afk5lVB0pWHM-erU31e5fa0OULz0-jkoe0c3x471gksUZcuXnsmT6hQjlURRCuxJxcA_RyICpGMzcPURF6JMayuYhXxJrNXcCw0h_t2jDnYTyDx8GBVEgGT3miEAkkWfolbIBkRIYHh2ujEnHh6HJUDf_OqPtxtCc6n3d_tCPvVeD1"
]

const motivationalMessages = [
  "You've conquered another milestone on your path to a brighter future. Keep the momentum going!",
  "Every completed day brings you closer to your transformation. Amazing progress!",
  "Your consistency is building the future you dreamed of. Well done!",
  "Another step forward on your journey to becoming your best self. Incredible work!",
  "You're proving that small daily actions create extraordinary results. Keep it up!"
]

export default function FigmaVictoryScreen({ 
  dayNumber = 23, 
  onContinue, 
  onShare, 
  onBack 
}: FigmaVictoryScreenProps) {
  const router = useRouter()
  
  // Get a consistent image and message based on day number
  const imageIndex = (dayNumber - 1) % victoryImages.length
  const messageIndex = (dayNumber - 1) % motivationalMessages.length
  const victoryImage = victoryImages[imageIndex]
  const motivationalMessage = motivationalMessages[messageIndex]

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      router.push('/dashboard')
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Simple web share API or fallback
      if (navigator.share) {
        navigator.share({
          title: 'FutureSync Victory!',
          text: `Just completed Day ${dayNumber} of my transformation journey with FutureSync! 🎉`,
          url: window.location.origin
        }).catch(console.error)
      } else {
        // Fallback: copy to clipboard
        const shareText = `Just completed Day ${dayNumber} of my transformation journey with FutureSync! 🎉 ${window.location.origin}`
        navigator.clipboard?.writeText(shareText)
        // Could show a toast notification here
      }
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
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
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            FutureSync
          </h2>
        </div>

        {/* Victory Content */}
        <h2 className="text-white tracking-tight text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Day {dayNumber} Complete!
        </h2>
        
        <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          {motivationalMessage}
        </p>

        {/* Hero Image */}
        <div className="flex w-full grow bg-[#1d1023] p-4">
          <div className="w-full gap-1 overflow-hidden bg-[#1d1023] aspect-[2/3] rounded-xl flex">
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1 transition-all duration-500 hover:scale-105"
              style={{ backgroundImage: `url("${victoryImage}")` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
            <button
              onClick={handleContinue}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#a50cf2] text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#9305d9] transition-colors duration-200 active:scale-95 transform"
            >
              <span className="truncate">Continue Your Journey</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#3c2249] text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#4a2d57] transition-colors duration-200 active:scale-95 transform"
            >
              <span className="truncate">Share Your Success</span>
            </button>
          </div>
        </div>
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
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Home</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/explore')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <Search size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Explore</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/journal')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <FileText size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Journal</p>
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