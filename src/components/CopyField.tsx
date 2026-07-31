import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface CopyFieldProps {
  value: string
  label?: string
  className?: string
}

export function CopyField({ value, label, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <p className="text-caption text-[var(--text-muted)]">{label}</p>}
      <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
        <code className="flex-1 truncate text-body font-mono">{value}</code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg p-2 text-[var(--accent)] hover:bg-[var(--card-bg)]"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
