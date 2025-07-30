"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowLeft, Github, Mail, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react"
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
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-red-400 space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center gap-1">
              <XCircle size={12} />
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

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

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccess("")

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Redirect to verification page after a short delay
        setTimeout(() => {
          router.push('/auth/verify-request')
        }, 2000)
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            fieldErrors[detail.field] = detail.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || 'Registration failed' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/welcome" })
    } catch (error) {
      setErrors({ general: "Something went wrong with social sign up" })
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
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <button 
          onClick={() => router.push("/")}
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Sign Up
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent mb-2">
              FutureMe
            </div>
            <p className="text-white/70">Start your transformation journey today</p>
          </div>

          {/* Social Sign Up */}
          <div className="space-y-3">
            <Button
              onClick={() => handleProviderSignIn("google")}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-gray-100 font-medium"
            >
              <Mail className="h-5 w-5 mr-3" />
              Continue with Google
            </Button>
            
            <Button
              onClick={() => handleProviderSignIn("github")}
              disabled={isLoading}
              className="w-full h-12 bg-[#24292e] text-white hover:bg-[#1c2127] font-medium"
            >
              <Github className="h-5 w-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1d1023] text-white/60">or create an account</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-[#2b1834] border ${
                  errors.name ? 'border-red-500' : 'border-[#563168]'
                } rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-[#2b1834] border ${
                  errors.email ? 'border-red-500' : 'border-[#563168]'
                } rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
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
                  placeholder="Create a strong password"
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
                Confirm Password
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
                  placeholder="Confirm your password"
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

            <div className="flex items-start gap-3">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#a50cf2] bg-[#2b1834] border-[#563168] rounded focus:ring-[#a50cf2] focus:ring-2"
              />
              <label htmlFor="acceptTerms" className="text-sm text-white/80">
                I agree to the{" "}
                <a href="/terms" className="text-[#a50cf2] hover:text-[#9305d9]">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#a50cf2] hover:text-[#9305d9]">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-400">{errors.acceptTerms}</p>
            )}

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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </GradientButton>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-white/60">
            Already have an account?{" "}
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