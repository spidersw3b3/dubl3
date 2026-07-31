import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FAQItem {
  question: string
  answer: ReactNode
}

export interface FAQAccordionProps {
  items: FAQItem[]
  className?: string
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className={cn('divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]', className)}>
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.question} className="bg-[var(--card-bg)] first:rounded-t-2xl last:rounded-b-2xl">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              <span className="text-body font-semibold">{item.question}</span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform', open && 'rotate-180')}
                aria-hidden
              />
            </button>
            {open && (
              <div className="px-4 pb-4 text-body text-[var(--text-muted)]">{item.answer}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
