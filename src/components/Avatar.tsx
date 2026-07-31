import { cn } from '@/lib/utils'

export interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function Avatar({ initials, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-[var(--accent)] text-white font-semibold',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}
