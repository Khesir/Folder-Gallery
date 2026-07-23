import { useEffect, useState } from 'react'

export function useWindowMaximized() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.isWindowMaximized().then(setIsMaximized)
    const unsubscribe = window.api.onWindowMaximizedChanged(setIsMaximized)
    return unsubscribe
  }, [])

  return isMaximized
}
