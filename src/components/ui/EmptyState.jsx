import { Icon } from '@iconify/react'
import clsx from 'clsx'

// "Nothing here yet" block for lists, cards and table bodies.
export default function EmptyState({ icon = 'lucide:inbox', title, message, action, compact = false, className }) {
  return (
    <div className={clsx('flex flex-col items-center text-center', compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12', className)}>
      <span
        className={clsx(
          'flex items-center justify-center rounded-full bg-surface-subtle text-fg-subtle',
          compact ? 'h-9 w-9' : 'h-12 w-12',
        )}
      >
        <Icon icon={icon} width={compact ? 18 : 22} height={compact ? 18 : 22} aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        {title && <p className="text-sm font-semibold text-fg">{title}</p>}
        {message && <p className={clsx('text-fg-muted', compact ? 'text-cell' : 'text-sm')}>{message}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
