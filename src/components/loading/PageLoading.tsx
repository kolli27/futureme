"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import LoadingSpinner from "./LoadingSpinner"

interface PageLoadingProps {
  message?: string
  className?: string
}

export default function PageLoading({ 
  message = "Loading...", 
  className 
}: PageLoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <LoadingSpinner size="lg" variant="gradient" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}