import { useRef } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const TONES = {
  danger: { icon: 'lucide:triangle-alert', badge: 'bg-danger-soft text-danger', button: 'danger' },
  warning: { icon: 'lucide:circle-alert', badge: 'bg-warning-soft text-warning', button: 'primary' },
  primary: { icon: 'lucide:circle-help', badge: 'bg-brand-50 text-brand-700', button: 'primary' },
  success: { icon: 'lucide:circle-check', badge: 'bg-success-soft text-success', button: 'success' },
}

// Yes/no confirmation. Focus starts on Cancel so Enter never confirms by accident.
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isLoading = false,
  confirmDisabled = false,
}) {
  const cancelRef = useRef(null)
  const t = TONES[tone] ?? TONES.danger
  const close = isLoading ? undefined : onClose

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
      size="sm"
      centered
      initialFocusRef={cancelRef}
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={t.button} onClick={onConfirm} isLoading={isLoading} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', t.badge)}>
          <Icon icon={t.icon} width="18" height="18" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-2 pt-1.5 text-sm text-fg-muted">
          {message && <p>{message}</p>}
          {children}
        </div>
      </div>
    </Modal>
  )
}
