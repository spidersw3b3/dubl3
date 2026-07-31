import { useCallback } from 'react'

interface UseConfirmCloseOptions {
  isDirty?: boolean
  message?: string
}

export function useConfirmClose({
  isDirty = false,
  message = 'You have unsaved changes. Discard them?',
}: UseConfirmCloseOptions = {}) {
  return useCallback(() => {
    if (!isDirty) return true
    return window.confirm(message)
  }, [isDirty, message])
}

/** Wrap onClose to confirm when form is dirty */
export function useGuardedClose(onClose: () => void, isDirty?: boolean) {
  const confirm = useConfirmClose({ isDirty })
  return useCallback(() => {
    if (confirm()) onClose()
  }, [confirm, onClose])
}
