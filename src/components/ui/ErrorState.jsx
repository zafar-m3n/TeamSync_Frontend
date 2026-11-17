import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Button from '@/components/ui/Button'

const KINDS = {
  error: {
    icon: 'lucide:cloud-alert',
    title: 'Something went wrong',
    message: "We couldn't load this. Check your connection and try again.",
    badge: 'bg-danger-soft text-danger',
  },
  offline: {
    icon: 'lucide:wifi-off',
    title: "Can't reach TeamSync",
    message: 'The server isn’t responding. Check your connection, then try again.',
    badge: 'bg-warning-soft text-warning',
  },
  forbidden: {
    icon: 'lucide:lock',
    title: "You don't have access",
    message: 'Ask an administrator if you think you should be able to see this.',
    badge: 'bg-warning-soft text-warning',
  },
}

// Failed-load block with an optional retry. `kind="forbidden"` is the 403 variant.
export default function ErrorState({ kind = 'error', title, message, onRetry, isRetrying = false, action, compact = false, className }) {
  const k = KINDS[kind] ?? KINDS.error
  return (
    <div
      role="alert"
      className={clsx('flex flex-col items-center text-center', compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12', className)}
    >
      <span className={clsx('flex items-center justify-center rounded-full', k.badge, compact ? 'h-9 w-9' : 'h-12 w-12')}>
        <Icon icon={k.icon} width={compact ? 18 : 22} height={compact ? 18 : 22} aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-semibold text-fg">{title ?? k.title}</p>
        <p className={clsx('text-fg-muted', compact ? 'text-cell' : 'text-sm')}>{message ?? k.message}</p>
      </div>
      {(onRetry || action) && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} isLoading={isRetrying}>
              <Icon icon="lucide:rotate-cw" width="14" height="14" aria-hidden />
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
