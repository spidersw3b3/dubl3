import { useState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'

export interface AdminConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: (reason: string) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
}: AdminConfirmDialogProps) {
  const [reason, setReason] = useState('')

  const handleClose = () => {
    setReason('')
    onCancel()
  }

  const handleConfirm = async () => {
    if (reason.trim().length < 3) return
    await onConfirm(reason.trim())
    setReason('')
  }

  return (
    <Modal open={open} title={title} onClose={handleClose}>
      <div className="space-y-4">
        {description && (
          <p className="text-body text-[var(--text-muted)]">{description}</p>
        )}
        <Input
          label="Reason (required)"
          placeholder="Document why this action is being taken"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <Button fullWidth disabled={loading || reason.trim().length < 3} onClick={handleConfirm}>
            {loading ? 'Processing…' : confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
