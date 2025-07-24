"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft, Menu, Bell, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  showMenu?: boolean
  showNotifications?: boolean
  showSettings?: boolean
  onBack?: () => void
  onMenu?: () => void
  onNotifications?: () => void
  onSettings?: () => void
  rightContent?: React.ReactNode
  className?: string
}

const routeTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Your transformation journey" },
  "/actions": { title: "Daily Actions", subtitle: "Today's focus" },
  "/insights": { title: "AI Insights", subtitle: "Personalized recommendations" },
  "/community": { title: "Community", subtitle: "Celebrate together" },
  "/profile": { title: "Profile", subtitle: "Your achievements" }
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  showNotifications = false,
  showSettings = false,
  onBack,
  onMenu,
  onNotifications,
  onSettings,
  rightContent,
  className
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Auto-detect title and subtitle from route if not provided
  const routeInfo = routeTitles[pathname]
  const displayTitle = title || routeInfo?.title || "FutureSync"
  const displaySubtitle = subtitle || routeInfo?.subtitle

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenu}
            className="p-2 h-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1">
          <h1 className="text-lg font-bold font-display text-foreground">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-sm text-muted-foreground">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {rightContent}
        
        {showNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotifications}
            className="p-2 h-auto relative"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
        )}

        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="p-2 h-auto"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        <ThemeToggle />
      </div>
    </div>
  )
}

// Preset header configurations for common pages
export function DashboardHeader() {
  return <Header showNotifications showSettings />
}

export function PageHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return <Header title={title} subtitle={subtitle} showBack />
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Header 
      title={title} 
      showBack 
      onBack={onClose}
      className="border-b"
    />
  )
}