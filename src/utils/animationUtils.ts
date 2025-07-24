// Animation Optimization Utilities
// Provides optimized animation configurations for 60fps performance

import { Variants } from 'framer-motion'

// Optimized easing functions for smooth animations
export const easings = {
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  linear: [0, 0, 1, 1]
} as const

// Performance-optimized animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    // Use transform3d for hardware acceleration
    transform: 'translate3d(0, 20px, 0)'
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transform: 'translate3d(0, -20px, 0)',
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
    transform: 'translate3d(0, -20px, 0)'
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transform: 'translate3d(0, 20px, 0)',
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
}

export const scaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    // Use transform3d for hardware acceleration
    transform: 'scale3d(0.8, 0.8, 1)'
  },
  animate: {
    scale: 1,
    opacity: 1,
    transform: 'scale3d(1, 1, 1)',
    transition: {
      duration: 0.3,
      ease: easings.snappy
    }
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transform: 'scale3d(0.9, 0.9, 1)',
    transition: {
      duration: 0.2,
      ease: easings.smooth
    }
  }
}

export const slideInRight: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
    transform: 'translate3d(100%, 0, 0)'
  },
  animate: {
    x: 0,
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transform: 'translate3d(-100%, 0, 0)',
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
}

export const slideInLeft: Variants = {
  initial: {
    x: '-100%',
    opacity: 0,
    transform: 'translate3d(-100%, 0, 0)'
  },
  animate: {
    x: 0,
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transform: 'translate3d(100%, 0, 0)',
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
}

// Stagger animation for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    transform: 'translate3d(0, 20px, 0)'
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transform: 'translate3d(0, -10px, 0)',
    transition: {
      duration: 0.2,
      ease: easings.smooth
    }
  }
}

// Optimized button press animation
export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: easings.snappy
  }
}

// Optimized progress bar animation
export const progressBar: Variants = {
  initial: {
    scaleX: 0,
    transformOrigin: '0% 50%'
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.5,
      ease: easings.smooth
    }
  })
}

// Floating animation for decorative elements
export const floating: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Pulse animation for attention-grabbing elements
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Page transition variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    transform: 'translate3d(0, 20px, 0)'
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: {
      duration: 0.5,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transform: 'translate3d(0, -20px, 0)',
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
}

// Utility function to create optimized animation configs
export function createOptimizedAnimation(
  type: 'fade' | 'scale' | 'slide' | 'bounce',
  duration = 0.3,
  delay = 0
) {
  const baseConfig = {
    transition: {
      duration,
      delay,
      ease: easings.smooth
    }
  }

  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, ...baseConfig },
        exit: { opacity: 0, transition: { duration: duration * 0.7 } }
      }
    
    case 'scale':
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1, ...baseConfig },
        exit: { scale: 0.9, opacity: 0, transition: { duration: duration * 0.7 } }
      }
    
    case 'slide':
      return {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1, ...baseConfig },
        exit: { x: -20, opacity: 0, transition: { duration: duration * 0.7 } }
      }
    
    case 'bounce':
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { 
          scale: 1, 
          opacity: 1, 
          transition: { 
            ...baseConfig.transition,
            ease: easings.bounce 
          }
        },
        exit: { scale: 0.8, opacity: 0, transition: { duration: duration * 0.7 } }
      }
    
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, ...baseConfig },
        exit: { opacity: 0 }
      }
  }
}

// Performance monitoring utilities
export function measureAnimationPerformance(animationName: string, callback: () => void) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now()
    callback()
    const end = performance.now()
    const duration = end - start
    
    if (duration > 16.67) { // More than one frame at 60fps
      console.warn(`Animation "${animationName}" took ${duration.toFixed(2)}ms (>16.67ms frame budget)`)
    } else {
      console.log(`Animation "${animationName}" took ${duration.toFixed(2)}ms ✅`)
    }
  } else {
    callback()
  }
}

// Reduced motion preferences
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get optimized animation config based on user preferences
export function getAnimationConfig(variants: Variants): Variants {
  if (shouldReduceMotion()) {
    // Return simplified animations for users who prefer reduced motion
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.1 } }
    }
  }
  
  return variants
}