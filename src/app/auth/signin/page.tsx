"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { ArrowLeft, Github, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        console.error("Sign in error:", result.error)
        setError(`Authentication failed: ${result.error}`)
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting...")
        router.push("/dashboard")
      } else {
        setError("Authentication failed")
      }
    } catch (error) {
      console.error("Sign in exception:", error)
      setError("Something went wrong with authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
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
          Sign In
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
            <p className="text-white/70">Welcome back to your transformation journey</p>
          </div>

          {/* Social Sign In */}
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
              <span className="px-4 bg-[#1d1023] text-white/60">or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-sm text-[#a50cf2] hover:text-[#9305d9]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-[#2b1834] border border-[#563168] rounded-lg text-white placeholder:text-[#b790cb] focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                  placeholder="Enter your password"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </GradientButton>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-white/60">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-[#a50cf2] hover:text-[#9305d9] font-medium"
            >
              Sign up
            </button>
          </div>

          {/* Demo Notice */}
          <div className="p-4 bg-[#a50cf2]/20 border border-[#a50cf2]/30 rounded-lg">
            <p className="text-sm text-white/90">
              <strong>Demo:</strong> Use any email/password combination to sign in, or use the social providers above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}