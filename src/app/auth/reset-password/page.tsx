"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { getPasswordStrength } from "@/lib/auth/password"

interface PasswordStrengthProps {
  password: string
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded ${
              index <= strength.score ? strengthColors[strength.score] : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400">
        Strength: {strengthLabels[strength.score]}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      validateToken(tokenFromUrl)
    } else {
      setIsValidating(false)
      setErrors({ general: "Reset token is missing" })
    }
  }, [searchParams])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${resetToken}`)
      const data = await response.json()

      if (response.ok) {
        setTokenValid(true)
        setUserEmail(data.user?.email || "")
      } else {
        setTokenValid(false)
        setErrors({ general: data.error || "Invalid or expired reset token" })
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setTokenValid(false)
      setErrors({ general: "Failed to validate reset token" })
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const strength = getPasswordStrength(formData.password)
      if (!strength.isStrong) {
        newErrors.password = "Password is not strong enough"
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully')
        }, 3000)
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            fieldErrors[detail.field] = detail.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || 'Password reset failed' })
        }
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Validating Reset Link</h1>
            <p className="text-white/70">Please wait while we validate your reset token...</p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Password Reset Successfully!</h1>
            <p className="text-white/70 mb-4">{success}</p>
            <p className="text-sm text-white/60">Redirecting you to sign in...</p>
          </div>
          <GradientButton
            onClick={() => router.push('/auth/signin')}
            className="w-full"
          >
            Continue to Sign In
          </GradientButton>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-white/70 mb-4">
              {errors.general || "This password reset link is invalid or has expired."}
            </p>
          </div>
          <div className="space-y-3">
            <GradientButton
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full"
            >
              Request New Reset Link
            </GradientButton>
            <Button
              onClick={() => router.push('/auth/signin')}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Back to Sign In
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
            <p className="text-white/70">Create a new password</p>
          </div>

          {/* User Info */}
          {userEmail && (
            <div className="text-center">
              <p className="text-sm text-white/60">
                Resetting password for: <span className="text-white font-medium">{userEmail}</span>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-[#2b1834] border ${
                    errors.password ? 'border-red-500' : 'border-[#563168]'
                  } rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent`}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-[#2b1834] border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#563168]'
                  } rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent`}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <GradientButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </GradientButton>
          </form>

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