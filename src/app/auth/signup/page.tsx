"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowLeft, Github, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleCredentialsSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      // In a real app, you'd create the user account first
      // For demo purposes, we'll just sign them in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to create account")
      } else {
        router.push("/welcome")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/welcome" })
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
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
      <div className="flex-1 flex items-center justify-center px-4">
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
              <span className="px-4 bg-[#1d1023] text-white/60">or sign up with email</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleCredentialsSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2b1834] border border-[#563168] rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 bg-[#2b1834] border border-[#563168] rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2b1834] border border-[#563168] rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <GradientButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </GradientButton>
          </form>

          {/* Terms */}
          <p className="text-xs text-white/60 text-center">
            By signing up, you agree to our{" "}
            <a href="#" className="text-[#a50cf2] hover:text-[#9305d9]">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-[#a50cf2] hover:text-[#9305d9]">Privacy Policy</a>
          </p>

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

          {/* Demo Notice */}
          <div className="p-4 bg-[#a50cf2]/20 border border-[#a50cf2]/30 rounded-lg">
            <p className="text-sm text-white/90">
              <strong>Demo:</strong> Use any email/password combination to create an account, or use the social providers above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}