"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Replace with your error reporting service
      // logErrorToService(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold font-display mb-2">
            Something went wrong
          </h1>
          
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. Don't worry, your data is safe and this has been reported.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Button onClick={resetError} className="w-full" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button onClick={handleReload} variant="outline" className="w-full">
            Reload Page
          </Button>
          
          <Button onClick={handleGoHome} variant="ghost" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Error Details Toggle */}
        <div className="text-left">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showDetails ? 'Hide' : 'Show'} Error Details
          </Button>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-48">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Specific error fallback for AI operations
export function AIErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            AI Service Temporarily Unavailable
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            We're having trouble connecting to our AI service. Your data is safe, and we're using backup recommendations.
          </p>
          <Button onClick={resetError} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<ErrorFallbackProps>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return ComponentWithErrorBoundary
}