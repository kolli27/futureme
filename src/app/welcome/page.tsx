"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import PageTransition from "@/components/transitions/PageTransition"

export default function WelcomePage() {
  const router = useRouter()

  const handleStartTransformation = () => {
    router.push('/onboarding')
  }

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <PageTransition>
        <div>
          {/* Hero Image Section */}
          <div className="px-4 py-3 sm:px-4 sm:py-3">
            <div
              className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#1d1023] rounded-xl min-h-80"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuByXx08bv1t9nRqTrQdBbiICH3ZA94WWjE8u6jQQLkqxR4J1UT4BkK4OfYzwnDw1o7q82u5AxJoMi-CFp2HB8fnHJx3GqEGBWIwzwpG09gENNJl1dgE9j93ZvR4qsSTg6H060QUMnxiPhtIbLP3rvGkSj8OafuG-qbIvBpo4BPn_OcmCE6Kb3Q0e_0Izqi_kGEWsyLQRci8FsfMgSsIjwr29E4SkTEFIv2oSXregXCGMIKhOVECZBl2DuXhr6nwXuf66klEVzfovLiz")`
              }}
            />
          </div>
          
          {/* Hero Text */}
          <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
            Become Your Future Self
          </h1>
          <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
            AI-powered daily habits that align with your future identity
          </p>
        </div>

        {/* Bottom CTA Section */}
        <div>
          <div className="flex px-4 py-3">
            <button
              onClick={handleStartTransformation}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#a50cf2] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#9305d9] transition-colors duration-200 active:scale-95 transform"
            >
              <span className="truncate">Start Your Transformation</span>
            </button>
          </div>
          <div className="h-5 bg-[#1d1023]" />
        </div>
      </PageTransition>
    </div>
  )
}