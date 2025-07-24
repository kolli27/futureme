"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { pageTransition, getAnimationConfig, shouldReduceMotion } from "@/utils/animationUtils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  type?: 'fade' | 'slide' | 'scale'
}

// Optimized page variants with hardware acceleration
const optimizedPageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export default function PageTransition({ children, className, type = 'fade' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("w-full h-full", className)}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      {children}
    </motion.div>
  )
}

// Route transition wrapper
interface RouteTransitionProps {
  children: React.ReactNode
  pathname: string
}

export function RouteTransition({ children, pathname }: RouteTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}