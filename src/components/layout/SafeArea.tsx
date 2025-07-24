"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export default function SafeArea({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true
}: SafeAreaProps) {
  return (
    <div className={cn(
      "w-full h-full",
      top && "pt-safe-top",
      bottom && "pb-safe-bottom",
      left && "pl-safe-left",
      right && "pr-safe-right",
      className
    )}>
      {children}
    </div>
  )
}