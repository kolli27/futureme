"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages | null

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

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
          Authentication Error
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-white/70 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <GradientButton
              onClick={() => router.push("/auth/signin")}
              className="w-full h-12"
            >
              Try signing in again
            </GradientButton>
            
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 border-white/20 text-white hover:bg-white/10"
            >
              Go back home
            </Button>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/60">
              Need help?{" "}
              <a href="mailto:support@futureme.app" className="text-[#a50cf2] hover:text-[#9305d9]">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}