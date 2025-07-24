// Accessibility Utilities for FutureSync
// Provides comprehensive accessibility support

// ARIA live region utilities
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey)
  
  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus()
  }
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  TAB: 'Tab'
} as const

export function handleKeyboardNavigation(
  event: KeyboardEvent | React.KeyboardEvent,
  handlers: Partial<Record<keyof typeof KEYBOARD_KEYS, () => void>>
) {
  const key = event.key
  const handler = Object.entries(KEYBOARD_KEYS).find(([, value]) => value === key)?.[0] as keyof typeof KEYBOARD_KEYS
  
  if (handler && handlers[handler]) {
    event.preventDefault()
    handlers[handler]!()
  }
}

// Skip link utility
export function createSkipLink(targetId: string, linkText: string = 'Skip to main content') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = linkText
  skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md'
  
  document.body.insertBefore(skipLink, document.body.firstChild)
  
  return skipLink
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  
  const brighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  
  return (brighter + 0.05) / (darker + 0.05)
}

function getLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  // Calculate relative luminance
  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function meetsWCAGAAContrast(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 4.5
}

export function meetsWCAGAAAContrast(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 7
}

// Reduced motion utilities
export function respectsReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function respectsReducedTransparency(): boolean {
  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches
}

export function respectsHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// ARIA helpers
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function setAriaAttributes(
  element: HTMLElement,
  attributes: Record<string, string | boolean | number>
) {
  Object.entries(attributes).forEach(([key, value]) => {
    const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`
    element.setAttribute(ariaKey, String(value))
  })
}

// Screen reader utilities
export function hideFromScreenReader(element: HTMLElement) {
  element.setAttribute('aria-hidden', 'true')
}

export function showToScreenReader(element: HTMLElement) {
  element.removeAttribute('aria-hidden')
}

// Focus restoration
let lastFocusedElement: HTMLElement | null = null

export function saveFocus() {
  lastFocusedElement = document.activeElement as HTMLElement
}

export function restoreFocus() {
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus()
    lastFocusedElement = null
  }
}

// Touch target utilities
export function makeTouchAccessible(element: HTMLElement) {
  // Ensure minimum touch target size (44px x 44px)
  const computedStyle = window.getComputedStyle(element)
  const width = parseInt(computedStyle.width)
  const height = parseInt(computedStyle.height)
  
  if (width < 44 || height < 44) {
    element.style.minWidth = '44px'
    element.style.minHeight = '44px'
    element.style.display = 'inline-flex'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
  }
}

// Form accessibility helpers
export function associateLabelWithInput(label: HTMLLabelElement, input: HTMLInputElement) {
  const id = input.id || generateId('input')
  input.id = id
  label.setAttribute('for', id)
}

export function addFormValidation(
  input: HTMLInputElement,
  errorElement: HTMLElement,
  validationMessage: string
) {
  const errorId = generateId('error')
  errorElement.id = errorId
  input.setAttribute('aria-describedby', errorId)
  
  input.addEventListener('invalid', () => {
    errorElement.textContent = validationMessage
    input.setAttribute('aria-invalid', 'true')
    announceToScreenReader(validationMessage, 'assertive')
  })
  
  input.addEventListener('input', () => {
    if (input.validity.valid) {
      errorElement.textContent = ''
      input.setAttribute('aria-invalid', 'false')
    }
  })
}

// Loading states accessibility
export function makeLoadingAccessible(
  element: HTMLElement,
  loadingText: string = 'Loading'
) {
  element.setAttribute('aria-busy', 'true')
  element.setAttribute('aria-label', loadingText)
  
  return () => {
    element.setAttribute('aria-busy', 'false')
    element.removeAttribute('aria-label')
  }
}

// Dialog accessibility
export function makeDialogAccessible(dialog: HTMLElement) {
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  
  // Add close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const closeButton = dialog.querySelector('[data-dialog-close]') as HTMLElement
      if (closeButton) closeButton.click()
    }
  }
  
  dialog.addEventListener('keydown', handleEscape)
  
  // Trap focus
  const cleanup = trapFocus(dialog)
  
  return () => {
    dialog.removeEventListener('keydown', handleEscape)
    cleanup()
  }
}