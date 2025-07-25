"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  User 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  {
    id: "actions",
    label: "Actions",
    icon: CheckSquare,
    path: "/actions"
  },
  {
    id: "insights",
    label: "Insights",
    icon: TrendingUp,
    path: "/insights"
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    path: "/community"
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    path: "/profile"
  }
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <>
      {/* Mobile/Tablet Bottom Navigation */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/50 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-safe-bottom">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path || 
              (item.path !== "/" && pathname.startsWith(item.path))

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] relative",
                  "hover:bg-accent/50 active:scale-95",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 relative",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} />
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                      {item.badge > 9 ? "9+" : item.badge}
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path || 
              (item.path !== "/" && pathname.startsWith(item.path))

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 w-full text-left relative",
                  "hover:bg-accent/50 active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                
                {/* Icon */}
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200 flex-shrink-0",
                  isActive && "scale-110"
                )} />
                
                {/* Label */}
                <span className={cn(
                  "text-sm font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="ml-auto h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}