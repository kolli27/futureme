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
      "md:max-w-2xl lg:max-w-4xl xl:max-w-6xl", // Progressive scaling for larger screens
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
        showNavigation && "pb-20 lg:pb-6", // Reduced bottom padding on desktop
        "px-4 py-6 sm:px-6 lg:px-8 xl:px-12", // Progressive responsive padding
      )}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showNavigation && navigation && (
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl z-50 lg:hidden">
          {navigation}
        </nav>
      )}
      
      {/* Desktop Sidebar Navigation */}
      {showNavigation && navigation && (
        <nav className="hidden lg:block fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-background/95 backdrop-blur border rounded-2xl p-4 shadow-lg">
            {navigation}
          </div>
        </nav>
      )}
    </div>
  )
}