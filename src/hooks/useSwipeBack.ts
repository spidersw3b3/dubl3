import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

interface UseSwipeBackOptions {
  enabled?: boolean
  edgeWidth?: number
  threshold?: number
}

/** Swipe from left edge → navigate back (React Router history -1) */
export function useSwipeBack({ enabled = true, edgeWidth = 30, threshold = 80 }: UseSwipeBackOptions = {}) {
  const navigate = useNavigate()
  const startRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!enabled) return

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch.clientX > edgeWidth) return
      startRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!startRef.current) return
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startRef.current.x
      const deltaY = Math.abs(touch.clientY - startRef.current.y)
      startRef.current = null

      if (deltaX > threshold && deltaY < threshold) {
        navigate(-1)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, edgeWidth, threshold, navigate])
}
