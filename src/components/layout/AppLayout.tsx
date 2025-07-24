"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  navigation?: React.ReactNode
  showHeader?: boolean
  showNavigation?: boolean
  className?: string
}

export default function AppLayout({
  children,
  header,
  navigation,
  showHeader = true,
  showNavigation = true,
  className
}: AppLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      "max-w-md mx-auto relative", // Mobile-first: max width for phone screens
      "lg:max-w-2xl", // Larger screens get more width
      className
    )}>
      {/* Header */}
      {showHeader && header && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {header}
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-hidden",
        showNavigation && "pb-20", // Add bottom padding for navigation
        "px-4 py-6 sm:px-6", // Responsive padding
      )}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showNavigation && navigation && (
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md lg:max-w-2xl z-50">
          {navigation}
        </nav>
      )}
    </div>
  )
}