import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGuardedClose } from '@/hooks/useConfirmClose'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  isDirty?: boolean
}

export function Modal({ open, onClose, title, children, className, isDirty }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--overlay)]"
        aria-label="Close modal"
        onClick={guardedClose}
      />
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl bg-[var(--bg-primary)]',
          'border border-[var(--border)] shadow-xl max-h-[90vh] overflow-y-auto',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 id="modal-title" className="text-title">
              {title}
            </h2>
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
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
