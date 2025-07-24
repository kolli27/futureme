"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Loader2, Brain, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface PulseLoaderProps {
  className?: string
  dotCount?: number
}

export function PulseLoader({ className, dotCount = 3 }: PulseLoaderProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-muted rounded', className)}>
      {children}
    </div>
  )
}

interface AIProcessingLoaderProps {
  step?: number
  totalSteps?: number
  message?: string
  className?: string
}

export function AIProcessingLoader({ 
  step = 1, 
  totalSteps = 4, 
  message = 'AI is thinking...',
  className 
}: AIProcessingLoaderProps) {
  const icons = [Brain, Target, Zap, Brain]
  const CurrentIcon = icons[(step - 1) % icons.length]
  
  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 flex items-center justify-center">
          <CurrentIcon className="h-6 w-6 text-white" />
        </div>
        
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      
      <div className="text-center">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex items-center mt-2">
          <div className="flex-1 bg-secondary rounded-full h-1.5 mr-3">
            <motion.div
              className="h-1.5 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-muted-foreground min-w-[3rem]">
            {step}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  )
}

interface PageLoadingProps {
  message?: string
  showProgress?: boolean
  progress?: number
}

export function PageLoading({ 
  message = 'Loading...', 
  showProgress = false, 
  progress = 0 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-600 rounded-2xl flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold font-display">{message}</h2>
          
          {showProgress && (
            <div className="w-full bg-secondary rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          <PulseLoader className="justify-center" />
        </div>
      </div>
    </div>
  )
}

interface ButtonLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function ButtonLoading({
  isLoading,
  children,
  loadingText,
  className,
  disabled,
  onClick
}: ButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </button>
  )
}

interface CardSkeletonProps {
  lines?: number
  showAvatar?: boolean
  className?: string
}

export function CardSkeleton({ lines = 3, showAvatar = false, className }: CardSkeletonProps) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )} 
          />
        ))}
      </div>
    </div>
  )
}

interface ListSkeletonProps {
  items?: number
  showAvatars?: boolean
  className?: string
}

export function ListSkeleton({ items = 3, showAvatars = true, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          {showAvatars && <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  
  const startLoading = React.useCallback(() => setIsLoading(true), [])
  const stopLoading = React.useCallback(() => setIsLoading(false), [])
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), [])
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  }
}