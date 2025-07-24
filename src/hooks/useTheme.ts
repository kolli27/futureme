import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      theme: undefined,
      setTheme,
      resolvedTheme: undefined,
      isDark: false,
      isLight: false,
      toggleTheme: () => {},
    }
  }

  const isDark = resolvedTheme === 'dark'
  const isLight = resolvedTheme === 'light'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark,
    isLight,
    toggleTheme,
  }
}