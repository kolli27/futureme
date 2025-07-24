"use client"

import * as React from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import { useDataMigration } from "@/hooks/useDataMigration"

interface GlobalErrorHandlerProps {
  children: React.ReactNode
}

export default function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const migrationState = useDataMigration()

  // Handle global unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Don't prevent default behavior in development
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault()
        
        // Show user-friendly error message
        showErrorToast('Something went wrong. Please try refreshing the page.')
      }
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      
      if (process.env.NODE_ENV === 'production') {
        // Log to error reporting service
        // logErrorToService(event.error)
        
        showErrorToast('An unexpected error occurred.')
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  // Handle migration errors
  if (migrationState.hasErrors) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Migration Error</h1>
          <p className="text-muted-foreground mb-6">
            There was an issue updating your data. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
          
          {migrationState.errors && (
            <details className="mt-4 text-xs text-left">
              <summary className="cursor-pointer text-muted-foreground">
                Show technical details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {migrationState.errors.join('\n')}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Show loading during migration
  if (migrationState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Updating your data...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error details
        console.error('App Error Boundary:', error, errorInfo)
        
        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
          // logErrorToService(error, errorInfo)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function showErrorToast(message: string) {
  // Create a simple toast notification
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 5000)
}