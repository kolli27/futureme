"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Email is required"
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccess("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Clear the form
        setEmail("")
      } else if (response.status === 429) {
        setErrors({ general: data.error })
      } else {
        setErrors({ general: data.error || 'Failed to send reset email' })
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-white/70">{success}</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Back to Sign In
            </Button>
            <Button
              onClick={() => {
                setSuccess("")
                setEmail("")
              }}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Try Different Email
            </Button>
          </div>
        </div>
      </div>
    )
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
          Reset Password
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent mb-2">
              FutureMe
            </div>
            <p className="text-white/70">Reset your password</p>
          </div>

          {/* Description */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Forgot your password?</h2>
            <p className="text-white/70 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: "" }))
                  }
                }}
                className={`w-full px-4 py-3 bg-[#2b1834] border ${
                  errors.email ? 'border-red-500' : 'border-[#563168]'
                } rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <GradientButton
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </GradientButton>
          </form>

          {/* Security Note */}
          <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-3 h-3 text-blue-500" />
              </div>
              <div className="text-sm text-white/80">
                <p className="font-medium mb-1">Security Note</p>
                <p>
                  For security reasons, we'll send the reset link even if the email doesn't exist in our system. 
                  If you don't receive an email, please check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-white/60">
            Remember your password?{" "}
            <button
              onClick={() => router.push("/auth/signin")}
              className="text-[#a50cf2] hover:text-[#9305d9] font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}