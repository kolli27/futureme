"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading/EnhancedLoadingStates"
import { makeTouchAccessible, announceToScreenReader } from "@/utils/accessibility"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  announcement?: string // Text to announce to screen readers on click
  longPressAction?: () => void // Action for long press (mobile accessibility)
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    announcement,
    longPressAction,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    
    // Merge refs
    React.useImperativeHandle(ref, () => buttonRef.current!)
    
    // Ensure touch accessibility
    React.useEffect(() => {
      if (buttonRef.current) {
        makeTouchAccessible(buttonRef.current)
      }
    }, [])
    
    // Long press handling for mobile accessibility
    React.useEffect(() => {
      if (!longPressAction || !buttonRef.current) return
      
      let longPressTimer: NodeJS.Timeout
      
      const startLongPress = () => {
        longPressTimer = setTimeout(() => {
          longPressAction()
          announceToScreenReader('Long press action activated', 'assertive')
        }, 500)
      }
      
      const cancelLongPress = () => {
        clearTimeout(longPressTimer)
      }
      
      const button = buttonRef.current
      button.addEventListener('touchstart', startLongPress)
      button.addEventListener('touchend', cancelLongPress)
      button.addEventListener('touchcancel', cancelLongPress)
      
      return () => {
        button.removeEventListener('touchstart', startLongPress)
        button.removeEventListener('touchend', cancelLongPress)
        button.removeEventListener('touchcancel', cancelLongPress)
        clearTimeout(longPressTimer)
      }
    }, [longPressAction])
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      if (announcement) {
        announceToScreenReader(announcement, 'polite')
      }
      
      onClick?.(event)
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={buttonRef}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-busy={loading}
        aria-label={loading ? loadingText || 'Loading' : props['aria-label']}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
AccessibleButton.displayName = "AccessibleButton"

export { AccessibleButton, buttonVariants }