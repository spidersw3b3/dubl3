import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'dashed'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'default', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl p-4',
        variant === 'default' && 'bg-[var(--card-bg)] border border-[var(--border)]',
        variant === 'elevated' && 'bg-[var(--bg-surface)] border border-[var(--border)] shadow-lg',
        variant === 'dashed' && 'border-2 border-dashed border-[var(--border)] bg-transparent',
        className,
      )}
      {...props}
    />
  )
})
