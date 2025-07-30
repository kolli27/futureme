"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyRequestPage() {
  const router = useRouter()

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
          Check Your Email
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

          {/* Email Icon */}
          <div className="w-20 h-20 bg-[#a50cf2]/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-[#a50cf2]" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <div className="text-white/70 space-y-2">
              <p>
                We've sent a verification link to your email address.
              </p>
              <p>
                Click the link in the email to verify your account and complete your registration.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-4 text-left space-y-3">
            <h3 className="font-semibold text-white">What to do next:</h3>
            <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Look for an email from FutureMe</li>
              <li>Click the "Verify Email Address" button</li>
              <li>Return here to sign in</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-[#a50cf2] hover:bg-[#9305d9] text-white"
            >
              Continue to Sign In
            </Button>
            <Button
              onClick={() => router.push('/auth/signup')}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Use Different Email
            </Button>
          </div>

          {/* Help */}
          <div className="text-sm text-white/60 space-y-2">
            <p>Didn't receive the email?</p>
            <div className="space-y-1">
              <p>• Check your spam or junk folder</p>
              <p>• Make sure you entered the correct email address</p>
              <p>• Wait a few minutes and check again</p>
            </div>
            <p className="pt-2">
              Still having trouble?{" "}
              <a href="/support" className="text-[#a50cf2] hover:text-[#9305d9]">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}