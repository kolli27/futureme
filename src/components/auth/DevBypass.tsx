"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function DevBypass() {
  const router = useRouter()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-yellow-900/90 border border-yellow-600 rounded-lg text-yellow-100 text-sm max-w-xs">
      <p className="font-bold mb-2">🛠️ Dev Mode</p>
      <p className="mb-3">Skip auth for testing:</p>
      <div className="space-y-2">
        <Button 
          size="sm" 
          onClick={() => router.push('/welcome')}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-yellow-900"
        >
          Go to Welcome
        </Button>
        <Button 
          size="sm" 
          onClick={() => router.push('/dashboard')}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-yellow-900"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}