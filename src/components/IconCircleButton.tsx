import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface IconCircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
}

export const IconCircleButton = forwardRef<HTMLButtonElement, IconCircleButtonProps>(
  function IconCircleButton({ className, label, size = 'md', children, ...props }, ref) {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          'flex flex-col items-center gap-2 group',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'bg-[var(--card-bg)] border border-[var(--border)]',
            'text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white',
            'transition-colors',
            sizeMap[size],
          )}
        >
          {children}
        </span>
        <span className="text-caption text-[var(--text-muted)]">{label}</span>
      </button>
    )
  },
)
