import { cn } from '@/lib/utils'

const LOGO_SRC = '/assets/dubl/logo.png'

export interface DublLogoProps {
  className?: string
  alt?: string
}

export function DublLogo({ className, alt = 'DUBL' }: DublLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={cn('object-contain', className)}
      draggable={false}
    />
  )
}
