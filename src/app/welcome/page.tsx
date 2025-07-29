"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import PageTransition from "@/components/transitions/PageTransition"
import { AuthGuard } from "@/components/auth/AuthGuard"

export default function WelcomePage() {
  const router = useRouter()

  const handleStartTransformation = () => {
    router.push('/onboarding')
  }

  return (
    <AuthGuard>
      <div 
        className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
        style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
      >
      <PageTransition>
        <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl w-full">
          <div>
            {/* Hero Visual Section */}
            <div className="px-4 py-3 sm:px-6 lg:px-8">
              <div className="w-full bg-gradient-to-br from-[#a50cf2] to-purple-800 rounded-xl min-h-80 md:min-h-96 lg:min-h-[400px] flex items-center justify-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-6 right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-white/20 text-8xl md:text-9xl font-bold">✨</div>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1023]/80 to-transparent"></div>
              </div>
            </div>
            
            {/* Hero Text */}
            <h1 className="text-white tracking-tight text-[32px] md:text-[40px] lg:text-[48px] font-bold leading-tight px-4 sm:px-6 lg:px-8 text-center pb-3 pt-6">
              Become Your Future Self
            </h1>
            <p className="text-white text-base md:text-lg lg:text-xl font-normal leading-normal pb-3 pt-1 px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
              AI-powered daily habits that align with your future identity
            </p>
          </div>

          {/* Bottom CTA Section */}
          <div>
            <div className="flex px-4 sm:px-6 lg:px-8 py-3 justify-center">
              <button
                onClick={handleStartTransformation}
                className="flex min-w-[200px] max-w-[400px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 md:h-14 px-8 bg-[#a50cf2] text-white text-base md:text-lg font-bold leading-normal tracking-[0.015em] hover:bg-[#9305d9] transition-colors duration-200 active:scale-95 transform"
              >
                <span className="truncate">Start Your Transformation</span>
              </button>
            </div>
            <div className="h-5 bg-[#1d1023]" />
          </div>
          </div>
        </PageTransition>
      </div>
    </AuthGuard>
  )
}