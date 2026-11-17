import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { selectDismiss, selectToasts, useToastStore } from '@/store/ui/toastStore'
import { toastEnter, toastExit } from '@/lib/motion'

const AUTO_DISMISS_MS = 4000

const TONES = {
  success: { icon: 'lucide:circle-check', iconColor: 'text-success', bar: 'bg-success' },
  danger: { icon: 'lucide:circle-x', iconColor: 'text-danger', bar: 'bg-danger' },
  warning: { icon: 'lucide:triangle-alert', iconColor: 'text-warning', bar: 'bg-warning' },
  info: { icon: 'lucide:info', iconColor: 'text-info', bar: 'bg-info' },
}

function Toast({ id, tone, message }) {
  const dismiss = useToastStore(selectDismiss)
  const ref = useRef(null)
  const timerRef = useRef(null)
  const leavingRef = useRef(false)
  const t = TONES[tone] ?? TONES.info

  const leave = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    clearTimeout(timerRef.current)
    toastExit(ref.current, () => dismiss(id))
  }, [dismiss, id])

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(leave, AUTO_DISMISS_MS)
  }, [leave])

  const pause = () => clearTimeout(timerRef.current)

  useEffect(() => {
    const tween = toastEnter(ref.current)
    startTimer()
    return () => {
      tween?.kill()
      clearTimeout(timerRef.current)
    }
  }, [startTimer])

  return (
    <div
      ref={ref}
      role={tone === 'danger' ? 'alert' : undefined}
      onMouseEnter={pause}
      onMouseLeave={startTimer}
      onFocus={pause}
      onBlur={startTimer}
      className="pointer-events-auto relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-lg border border-line bg-surface py-3 pl-4 pr-3 shadow-lg"
    >
      <span className={clsx('absolute inset-y-0 left-0 w-1', t.bar)} aria-hidden />
      <Icon icon={t.icon} width="20" height="20" className={clsx('mt-px shrink-0', t.iconColor)} aria-hidden />
      <p className="flex-1 text-sm text-fg">{message}</p>
      <button
        type="button"
        onClick={leave}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-0.5 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg focus-visible:focus-ring"
      >
        <Icon icon="lucide:x" width="16" height="16" aria-hidden />
      </button>
    </div>
  )
}

// Rendered once, outside the app root, so toasts stay reachable while a modal
// makes the root inert.
export function Toaster() {
  const toasts = useToastStore(selectToasts)
  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notifications"
      role="region"
      className="pointer-events-none fixed right-4 top-4 z-100 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} tone={t.tone} message={t.message} />
      ))}
    </div>,
    document.body,
  )
}
