import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  variant?: 'info' | 'success' | 'error'
  visible: boolean
}

const variantClasses = {
  info: 'bg-[var(--bg-surface)] border-[var(--border)]',
  success: 'bg-[var(--success)]/15 border-[var(--success)] text-[var(--success)]',
  error: 'bg-[var(--danger)]/15 border-[var(--danger)] text-[var(--danger)]',
}

export function Toast({ message, variant = 'info', visible }: ToastProps) {
  if (!visible) return null

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-body shadow-lg',
        variantClasses[variant],
      )}
    >
      {message}
    </div>
  )
}
