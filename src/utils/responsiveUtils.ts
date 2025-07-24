// Responsive Design Testing and Utilities
// Provides utilities for responsive design and device detection

// Breakpoint definitions (matching Tailwind CSS)
export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  '2xl': 1536 // 2X Extra large devices
} as const

export type Breakpoint = keyof typeof breakpoints

// Device type detection
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < breakpoints.md) return 'mobile'
  if (width < breakpoints.lg) return 'tablet'
  return 'desktop'
}

// Responsive hook for component adaptation
export function useResponsive() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [screenWidth, setScreenWidth] = React.useState(0)
  
  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      setDeviceType(getDeviceType())
    }
    
    // Initial call
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return {
    deviceType,
    screenWidth,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isSmallScreen: screenWidth < breakpoints.md,
    isMediumScreen: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
    isLargeScreen: screenWidth >= breakpoints.lg
  }
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)
    
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])
  
  return matches
}

// Responsive text sizing
export function getResponsiveTextSize(
  baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl',
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string {
  const sizeMap = {
    mobile: {
      xs: 'text-xs',
      sm: 'text-sm', 
      base: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl',
      '3xl': 'text-2xl'
    },
    tablet: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    },
    desktop: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    }
  }
  
  return sizeMap[deviceType][baseSize]
}

// Safe area utilities for mobile devices
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
  }
}

// Responsive spacing utilities
export function getResponsiveSpacing(
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string {
  const spacingMap = {
    mobile: {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
      xl: 'p-6'
    },
    tablet: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8'
    },
    desktop: {
      xs: 'p-4',
      sm: 'p-5',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }
  }
  
  return spacingMap[deviceType][size]
}

// Touch target validation
export function validateTouchTargets() {
  if (typeof window === 'undefined') return
  
  const clickableElements = document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]')
  const invalidTargets: Element[] = []
  
  clickableElements.forEach(element => {
    const rect = element.getBoundingClientRect()
    const minSize = 44 // 44px minimum as per WCAG guidelines
    
    if (rect.width < minSize || rect.height < minSize) {
      invalidTargets.push(element)
    }
  })
  
  if (invalidTargets.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(`Found ${invalidTargets.length} touch targets smaller than 44px:`, invalidTargets)
  }
  
  return invalidTargets
}

// Responsive image utilities
export function getResponsiveImageSrc(
  baseSrc: string,
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string {
  // If using a CDN that supports responsive images
  const sizeMap = {
    mobile: '400w',
    tablet: '800w', 
    desktop: '1200w'
  }
  
  // Example for services like Cloudinary, ImageKit, etc.
  if (baseSrc.includes('cloudinary.com')) {
    return baseSrc.replace('/upload/', `/upload/w_${sizeMap[deviceType]}/`)
  }
  
  return baseSrc
}

// Orientation change detection
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')
  
  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
    
    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])
  
  return orientation
}

// Responsive grid utilities
export function getResponsiveColumns(
  itemCount: number,
  deviceType: 'mobile' | 'tablet' | 'desktop'
): number {
  const columnMap = {
    mobile: Math.min(itemCount, 1),
    tablet: Math.min(itemCount, 2),
    desktop: Math.min(itemCount, 3)
  }
  
  return columnMap[deviceType]
}

// Test responsive breakpoints
export function testResponsiveBreakpoints() {
  if (process.env.NODE_ENV !== 'development') return
  
  console.log('🔍 Responsive Breakpoint Testing:')
  console.log(`Current width: ${window.innerWidth}px`)
  console.log(`Device type: ${getDeviceType()}`)
  
  Object.entries(breakpoints).forEach(([name, width]) => {
    const matches = window.innerWidth >= width
    console.log(`${name} (${width}px): ${matches ? '✅' : '❌'}`)
  })
}

// React import for hooks
import * as React from 'react'