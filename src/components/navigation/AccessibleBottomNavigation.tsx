"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { House, List, BarChart3, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { handleKeyboardNavigation, KEYBOARD_KEYS, announceToScreenReader } from "@/utils/accessibility"

interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<any>
  badge?: number
}

const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: House
  },
  {
    path: '/actions',
    label: 'Daily Actions',
    icon: List
  },
  {
    path: '/insights',
    label: 'AI Insights',
    icon: BarChart3
  },
  {
    path: '/community',
    label: 'Community',
    icon: Users,
    badge: 3 // Example: 3 new posts
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User
  }
]

interface AccessibleBottomNavigationProps {
  className?: string
}

export default function AccessibleBottomNavigation({ className }: AccessibleBottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const navRef = React.useRef<HTMLElement>(null)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const handleNavigation = (path: string, label: string) => {
    router.push(path)
    announceToScreenReader(`Navigated to ${label}`, 'polite')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    handleKeyboardNavigation(event, {
      ARROW_LEFT: () => {
        const newIndex = index > 0 ? index - 1 : navigationItems.length - 1
        setFocusedIndex(newIndex)
        const button = navRef.current?.children[newIndex]?.querySelector('button') as HTMLButtonElement
        button?.focus()
      },
      ARROW_RIGHT: () => {
        const newIndex = index < navigationItems.length - 1 ? index + 1 : 0
        setFocusedIndex(newIndex)
        const button = navRef.current?.children[newIndex]?.querySelector('button') as HTMLButtonElement
        button?.focus()
      },
      HOME: () => {
        setFocusedIndex(0)
        const button = navRef.current?.children[0]?.querySelector('button') as HTMLButtonElement
        button?.focus()
      },
      END: () => {
        const lastIndex = navigationItems.length - 1
        setFocusedIndex(lastIndex)
        const button = navRef.current?.children[lastIndex]?.querySelector('button') as HTMLButtonElement
        button?.focus()
      }
    })
  }

  return (
    <nav 
      ref={navRef}
      className={cn(
        "flex gap-2 border-t border-[#3c2249] bg-[#2b1834] px-4 pb-3 pt-2",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {navigationItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.path
        const isCurrentlyFocused = focusedIndex === index

        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path, item.label)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            className={cn(
              "flex flex-1 flex-col items-center justify-end gap-1 rounded-lg p-2 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              "hover:bg-white/5",
              isActive ? "text-white" : "text-[#b790cb]"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${item.label}${item.badge ? ` (${item.badge} new)` : ''}${isActive ? ', current page' : ''}`}
            tabIndex={index === 0 && focusedIndex === -1 ? 0 : focusedIndex === index ? 0 : -1}
          >
            <div className="relative flex h-8 items-center justify-center">
              <Icon 
                size={24} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-[#b790cb]"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
              
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            
            <span 
              className={cn(
                "text-xs font-medium leading-normal tracking-[0.015em] transition-colors",
                isActive ? "text-white" : "text-[#b790cb]"
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// Skip link component for keyboard navigation
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }) {
  const handleSkip = () => {
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={handleSkip}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      Skip to main content
    </button>
  )
}