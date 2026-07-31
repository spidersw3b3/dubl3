import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SwipeableCarouselProps {
  items: ReactNode[]
  className?: string
  onIndexChange?: (index: number) => void
}

export function SwipeableCarousel({ items, className, onIndexChange }: SwipeableCarouselProps) {
  const [index, setIndex] = useState(0)

  const goTo = (i: number) => {
    setIndex(i)
    onIndexChange?.(i)
  }

  if (items.length === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className="overflow-hidden"
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX
          const el = e.currentTarget
          const onEnd = (ev: TouchEvent) => {
            const delta = ev.changedTouches[0].clientX - startX
            if (delta > 50 && index > 0) goTo(index - 1)
            if (delta < -50 && index < items.length - 1) goTo(index + 1)
            el.removeEventListener('touchend', onEnd)
          }
          el.addEventListener('touchend', onEnd, { once: true })
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-full shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === index ? 'bg-[var(--accent)]' : 'bg-[var(--border)]',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
