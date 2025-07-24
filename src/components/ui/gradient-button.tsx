"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-teal-400 hover:to-purple-500",
        outline:
          "border-2 border-transparent bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-border text-foreground hover:text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-purple-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative before:absolute before:inset-0 before:rounded-[10px] before:bg-background before:m-[2px] before:-z-10",
        ghost:
          "text-teal-600 dark:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-purple-50 dark:hover:from-teal-950/50 dark:hover:to-purple-950/50 hover:text-teal-700 dark:hover:text-teal-300",
        secondary:
          "bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 text-teal-700 dark:text-teal-300 hover:from-teal-200 hover:to-purple-200 dark:hover:from-teal-900/50 dark:hover:to-purple-900/50 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-red-400 hover:to-pink-500",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }