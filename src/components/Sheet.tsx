import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGuardedClose } from '@/hooks/useConfirmClose'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  isDirty?: boolean
}

/** Bottom sheet variant for send/pay flows */
export function Sheet({ open, onClose, title, children, className, isDirty }: SheetProps) {
  const guardedClose = useGuardedClose(onClose, isDirty)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') guardedClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, guardedClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--overlay)]"
        aria-label="Close sheet"
        onClick={guardedClose}
      />
      <div
        className={cn(
          'relative z-10 rounded-t-3xl bg-[var(--bg-primary)] border-t border-[var(--border)]',
          'max-h-[92vh] overflow-y-auto safe-bottom',
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--border)]" />
        {title && (
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-title">{title}</h2>
            <button
              type="button"
              onClick={guardedClose}
              className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  )
}
