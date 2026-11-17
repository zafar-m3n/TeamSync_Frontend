import clsx from 'clsx'
import { Icon } from '@iconify/react'

// Real <input> kept for native keyboard / assistive-tech / form semantics; the
// visible box is a peer-styled sibling. `locked` is a deliberate "can't change"
// state, styled differently from a plain `disabled`. `pending` marks a value
// staged but not yet committed.
export default function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  locked = false,
  pending = false,
  title,
  className,
  ...rest
}) {
  const off = disabled || locked

  return (
    <label
      title={title}
      className={clsx(
        'relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-transparent',
        pending && 'border-dashed border-warning',
        off ? 'cursor-not-allowed' : 'cursor-pointer',
        disabled && !locked && 'opacity-50',
        className,
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} disabled={off} className="peer sr-only" {...rest} />

      <span
        aria-hidden="true"
        className={clsx(
          'h-4 w-4 shrink-0 rounded-[4px] border transition-colors duration-(--duration-fast)',
          'peer-focus-visible:shadow-(--focus-ring)',
          locked
            ? 'border-line bg-surface-subtle'
            : 'border-line-strong bg-surface peer-hover:border-fg-muted peer-checked:border-brand-600 peer-checked:bg-brand-600',
        )}
      />

      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 flex items-center justify-center transition duration-(--duration-fast)',
          locked ? 'text-fg-subtle' : 'scale-75 text-on-brand opacity-0 peer-checked:scale-100 peer-checked:opacity-100',
        )}
      >
        <Icon icon={locked ? 'lucide:lock' : 'lucide:check'} width={locked ? 11 : 12} height={locked ? 11 : 12} strokeWidth={3} />
      </span>
    </label>
  )
}
