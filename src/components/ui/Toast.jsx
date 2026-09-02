import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { ToastContext } from '../../hooks/useToast'

const AUTO_DISMISS_MS = 4000

const toneConfig = {
  success: { icon: 'lucide:circle-check', accent: 'border-emerald-500', iconColor: 'text-emerald-600' },
  danger: { icon: 'lucide:circle-x', accent: 'border-red-500', iconColor: 'text-red-600' },
  warning: { icon: 'lucide:triangle-alert', accent: 'border-amber-500', iconColor: 'text-amber-600' },
  info: { icon: 'lucide:info', accent: 'border-sky-500', iconColor: 'text-sky-600' },
  neutral: { icon: 'lucide:bell', accent: 'border-gray-400', iconColor: 'text-gray-600' },
}

function Toast({ tone = 'info', message, onDismiss }) {
  const ref = useRef(null)
  const timerRef = useRef(null)
  const leavingRef = useRef(false)
  const config = toneConfig[tone] ?? toneConfig.info

  const leave = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    clearTimeout(timerRef.current)
    gsap.to(ref.current, {
      x: 24,
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onDismiss,
    })
  }, [onDismiss])

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(leave, AUTO_DISMISS_MS)
  }, [leave])

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { x: 24, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
    )
    startTimer()
    return () => clearTimeout(timerRef.current)
  }, [startTimer])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={startTimer}
      className={clsx(
        'pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-lg',
        config.accent,
      )}
    >
      <Icon
        icon={config.icon}
        width="20"
        height="20"
        className={clsx('mt-0.5 shrink-0', config.iconColor)}
      />
      <p className="flex-1 text-sm text-text">{message}</p>
      <button
        type="button"
        onClick={leave}
        aria-label="Dismiss notification"
        className="-mr-1 shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon icon="lucide:x" width="16" height="16" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((tone, message) => {
    const id = (idRef.current += 1)
    setToasts((prev) => [{ id, tone, message }, ...prev])
    return id
  }, [])

  const toast = useMemo(
    () => ({
      success: (message) => add('success', message),
      error: (message) => add('danger', message),
      info: (message) => add('info', message),
      warning: (message) => add('warning', message),
    }),
    [add],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-100 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            message={t.message}
            onDismiss={() => remove(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default Toast
