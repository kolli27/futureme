"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import PageTransition from "@/components/transitions/PageTransition"
import { TimebudgetDashboard } from "@/components/time-budget/TimebudgetDashboard"
import FigmaTimeBudget from "@/components/time-budget/FigmaTimeBudget"
import { TimeBudgetAllocation } from "@/types"

export default function TimeBudgetPage() {
  const router = useRouter()
  const [useFigmaDesign, setUseFigmaDesign] = React.useState(true) // Toggle for design comparison

  const handleComplete = (allocation?: TimeBudgetAllocation) => {
    // Store the allocation and navigate to actions
    if (allocation) {
      localStorage.setItem('current-time-budget', JSON.stringify(allocation))
    }
    router.push('/actions')
  }

  const handleBack = () => {
    router.push('/onboarding')
  }

  // Use Figma design by default
  if (useFigmaDesign) {
    return (
      <PageTransition>
        <FigmaTimeBudget 
          onBack={handleBack}
          onComplete={() => handleComplete()}
        />
      </PageTransition>
    )
  }

  // Fallback to original design
  return (
    <div className="min-h-screen-mobile bg-gradient-card">
      <PageTransition>
        <div className="container mx-auto px-6 py-8 max-w-md">
          <TimebudgetDashboard onComplete={handleComplete} />
        </div>
      </PageTransition>
    </div>
  )
}