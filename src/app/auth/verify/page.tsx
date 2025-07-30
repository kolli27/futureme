"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting')
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      verifyToken(tokenFromUrl)
    }
  }, [searchParams])

  const verifyToken = async (verificationToken: string) => {
    if (!verificationToken) return

    setIsLoading(true)
    setStatus('loading')

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Email verified successfully')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Email verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualVerification = () => {
    if (token) {
      verifyToken(token)
    }
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <button 
          onClick={() => router.push("/auth/signin")}
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Email Verification
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent mb-2">
              FutureMe
            </div>
          </div>

          {/* Status Display */}
          {status === 'loading' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
                <p className="text-white/70">Please wait while we verify your email address...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-white/70 mb-4">{message}</p>
                <p className="text-sm text-white/60">Redirecting you to sign in...</p>
              </div>
              <GradientButton
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              >
                Continue to Sign In
              </GradientButton>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-white/70 mb-4">{message}</p>
              </div>
              <div className="space-y-3">
                {token && (
                  <GradientButton
                    onClick={handleManualVerification}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Trying Again...
                      </>
                    ) : (
                      "Try Again"
                    )}
                  </GradientButton>
                )}
                <Button
                  onClick={() => router.push('/auth/signin')}
                  variant="outline"
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}

          {status === 'waiting' && !token && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-white/70 mb-4">
                  We've sent a verification link to your email address. Click the link in the email to verify your account.
                </p>
                <p className="text-sm text-white/60">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                  variant="outline"
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-white/50 text-center">
            <p>
              Having trouble? Contact our{" "}
              <a href="/support" className="text-[#a50cf2] hover:text-[#9305d9]">
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}