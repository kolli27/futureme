// Haptic Feedback Utilities for Mobile Interactions
// Provides tactile feedback for enhanced mobile user experience

// Haptic feedback types supported by modern mobile browsers
export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification'

// Haptic patterns for different interaction types
export const HAPTIC_PATTERNS = {
  // Button interactions
  buttonTap: 'light' as const,
  buttonPress: 'medium' as const,
  buttonSuccess: 'heavy' as const,
  
  // Navigation
  navigationSwipe: 'selection' as const,
  pageTransition: 'light' as const,
  
  // Form interactions
  inputFocus: 'selection' as const,
  inputError: 'heavy' as const,
  inputSuccess: 'medium' as const,
  
  // Action completion
  taskComplete: 'heavy' as const,
  achievement: 'heavy' as const,
  
  // Timer interactions
  timerStart: 'medium' as const,
  timerPause: 'light' as const,
  timerComplete: 'heavy' as const,
  
  // UI feedback
  toggle: 'selection' as const,
  swipeRefresh: 'light' as const,
  longPress: 'medium' as const
} as const

// Check if haptic feedback is supported
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator
}

// Check if advanced haptic feedback is supported (iOS Safari)
export function isAdvancedHapticSupported(): boolean {
  return typeof window !== 'undefined' && 
         'navigator' in window && 
         'vibrate' in navigator &&
         // @ts-ignore - Experimental API
         ('hapticFeedback' in navigator || window.DeviceMotionEvent !== undefined)
}

// Basic vibration patterns (in milliseconds)
const VIBRATION_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  selection: [5],
  impact: [15, 10, 15],
  notification: [100, 50, 100],
  pulse: [200, 100, 200],
  heartbeat: [100, 30, 100, 30, 100],
  success: [10, 10, 10],
  error: [50, 50, 50, 50, 50]
} as const

// Main haptic feedback function
export function triggerHapticFeedback(
  type: HapticType = 'light',
  force: boolean = false
): void {
  // Skip if user has disabled haptics (via system settings or preferences)
  if (!force && !shouldEnableHaptics()) {
    return
  }
  
  if (!isHapticSupported()) {
    return
  }
  
  try {
    // Try advanced haptic feedback first (iOS Safari)
    if (isAdvancedHapticSupported()) {
      triggerAdvancedHaptic(type)
      return
    }
    
    // Fallback to basic vibration
    const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.light
    navigator.vibrate(pattern)
    
  } catch (error) {
    console.warn('Haptic feedback failed:', error)
  }
}

// Advanced haptic feedback for supported devices
function triggerAdvancedHaptic(type: HapticType): void {
  try {
    // @ts-ignore - Experimental iOS Safari API
    if (window.navigator.vibrate && window.DeviceMotionEvent) {
      const pattern = VIBRATION_PATTERNS[type]
      navigator.vibrate(pattern)
    }
  } catch (error) {
    // Fallback to basic vibration
    const pattern = VIBRATION_PATTERNS[type]
    navigator.vibrate(pattern)
  }
}

// Check user preferences for haptics
function shouldEnableHaptics(): boolean {
  // Check if user has disabled haptics in their preferences
  const userPreference = localStorage.getItem('haptics-enabled')
  if (userPreference !== null) {
    return userPreference === 'true'
  }
  
  // Default to enabled for mobile devices
  return window.innerWidth <= 768
}

// Haptic feedback for specific UI interactions
export const hapticFeedback = {
  // Button interactions
  buttonTap: () => triggerHapticFeedback('light'),
  buttonPress: () => triggerHapticFeedback('medium'),
  buttonSuccess: () => triggerHapticFeedback('heavy'),
  
  // Navigation
  navigationChange: () => triggerHapticFeedback('selection'),
  pageSwipe: () => triggerHapticFeedback('light'),
  
  // Form interactions
  inputFocus: () => triggerHapticFeedback('selection'),
  inputError: () => triggerHapticFeedback('heavy'),
  inputSuccess: () => triggerHapticFeedback('medium'),
  
  // Action completion
  taskComplete: () => {
    // Special pattern for task completion
    triggerHapticFeedback('heavy')
    setTimeout(() => triggerHapticFeedback('light'), 100)
  },
  
  achievement: () => {
    // Celebration pattern
    triggerHapticFeedback('heavy')
    setTimeout(() => triggerHapticFeedback('medium'), 100)
    setTimeout(() => triggerHapticFeedback('heavy'), 200)
  },
  
  // Timer interactions
  timerStart: () => triggerHapticFeedback('medium'),
  timerPause: () => triggerHapticFeedback('light'),
  timerComplete: () => {
    // Timer completion pattern
    triggerHapticFeedback('heavy')
    setTimeout(() => triggerHapticFeedback('light'), 50)
    setTimeout(() => triggerHapticFeedback('light'), 100)
  },
  
  // UI feedback
  toggle: () => triggerHapticFeedback('selection'),
  swipeRefresh: () => triggerHapticFeedback('light'),
  longPress: () => triggerHapticFeedback('medium'),
  
  // Error states
  error: () => {
    navigator.vibrate([50, 50, 50])
  },
  
  // Success states
  success: () => {
    navigator.vibrate([10, 10, 10])
  }
}

// Hook for haptic feedback in React components
export function useHapticFeedback() {
  const [isEnabled, setIsEnabled] = React.useState(() => shouldEnableHaptics())
  
  const updatePreference = (enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem('haptics-enabled', enabled.toString())
  }
  
  const trigger = React.useCallback((type: HapticType = 'light') => {
    if (isEnabled) {
      triggerHapticFeedback(type)
    }
  }, [isEnabled])
  
  return {
    isEnabled,
    isSupported: isHapticSupported(),
    setEnabled: updatePreference,
    trigger,
    // Convenience methods
    ...Object.fromEntries(
      Object.entries(hapticFeedback).map(([key, fn]) => [
        key,
        () => isEnabled && fn()
      ])
    )
  }
}

// Haptic feedback for gesture interactions
export function enableHapticGestures(element: HTMLElement) {
  if (!isHapticSupported()) return () => {}
  
  let touchStartTime = 0
  let longPressTimer: NodeJS.Timeout
  
  const handleTouchStart = (e: TouchEvent) => {
    touchStartTime = Date.now()
    
    // Long press detection
    longPressTimer = setTimeout(() => {
      hapticFeedback.longPress()
    }, 500)
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    clearTimeout(longPressTimer)
    
    const touchDuration = Date.now() - touchStartTime
    
    // Quick tap
    if (touchDuration < 150) {
      hapticFeedback.buttonTap()
    }
    // Medium press
    else if (touchDuration < 500) {
      hapticFeedback.buttonPress()
    }
  }
  
  const handleTouchCancel = () => {
    clearTimeout(longPressTimer)
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
  
  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)
    clearTimeout(longPressTimer)
  }
}

// Settings toggle for haptic feedback - exported as utility function
export function createHapticToggle(
  isEnabled: boolean, 
  setEnabled: (enabled: boolean) => void,
  isSupported: boolean
) {
  if (!isSupported) return null
  
  return {
    isEnabled,
    setEnabled,
    toggle: () => {
      const newValue = !isEnabled
      setEnabled(newValue)
      if (newValue) {
        triggerHapticFeedback('medium')
      }
    }
  }
}

// React import for hook
import * as React from 'react'