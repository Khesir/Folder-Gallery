import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme-override'

export function useTheme() {
  const [systemIsDark, setSystemIsDark] = useState(false)
  const [override, setOverride] = useState(() => localStorage.getItem(STORAGE_KEY))

  useEffect(() => {
    window.api.getTheme().then(setSystemIsDark)
    const unsubscribe = window.api.onThemeChanged(setSystemIsDark)
    return unsubscribe
  }, [])

  const theme = override ?? (systemIsDark ? 'dark' : 'light')

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    setOverride(next)
  }

  return { theme, toggleTheme }
}
