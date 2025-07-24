import { useState, useEffect, useRef } from 'react'

export function useTimer(initialTime: number, onComplete?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining, onComplete])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = (newTime?: number) => {
    setIsRunning(false)
    setTimeRemaining(newTime ?? initialTime)
  }

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    reset,
    progress: ((initialTime - timeRemaining) / initialTime) * 100
  }
}