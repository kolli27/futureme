"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/auth/AuthGuard"
import PageTransition from "@/components/transitions/PageTransition"
import FigmaVictoryScreen from "@/components/victory/FigmaVictoryScreen"
import { useVictory } from "@/hooks/useVictory"

function VictoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getCurrentDayNumber, dismissVictory } = useVictory()
  
  // Get day number from URL params or use current day
  const dayNumber = parseInt(searchParams.get('day') || getCurrentDayNumber().toString())

  const handleContinue = () => {
    dismissVictory()
    router.push('/dashboard')
  }

  const handleShare = () => {
    // Handle sharing logic
    if (navigator.share) {
      navigator.share({
        title: 'FutureSync Victory! 🎉',
        text: `Just completed Day ${dayNumber} of my transformation journey with FutureSync!`,
        url: window.location.origin
      }).catch(console.error)
    } else {
      // Fallback: copy to clipboard
      const shareText = `Just completed Day ${dayNumber} of my transformation journey with FutureSync! 🎉 ${window.location.origin}`
      navigator.clipboard?.writeText(shareText).then(() => {
        // Could show a success toast here
        console.log('Share text copied to clipboard')
      }).catch(console.error)
    }
  }

  const handleBack = () => {
    dismissVictory()
    router.back()
  }

  return (
    <PageTransition>
      <FigmaVictoryScreen
        dayNumber={dayNumber}
        onContinue={handleContinue}
        onShare={handleShare}
        onBack={handleBack}
      />
    </PageTransition>
  )
}

export default function VictoryPageWithAuth() {
  return (
    <AuthGuard>
      <VictoryPage />
    </AuthGuard>
  )
}
