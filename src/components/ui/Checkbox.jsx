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
        pending && 'border-dashed border-amber-500',
        off ? 'cursor-not-allowed' : 'cursor-pointer',
        disabled && !locked && 'opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={off}
        className="peer sr-only"
        {...rest}
      />

      <span
        aria-hidden="true"
        className={clsx(
          'h-4 w-4 shrink-0 rounded border transition-colors duration-150 motion-reduce:transition-none',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
          locked
            ? 'border-gray-300 bg-gray-100'
            : 'border-gray-300 bg-white peer-checked:border-accent peer-checked:bg-accent',
        )}
      />

      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 flex items-center justify-center transition duration-150 motion-reduce:transition-none',
          locked
            ? 'text-gray-400'
            : 'scale-90 text-white opacity-0 peer-checked:scale-100 peer-checked:opacity-100',
        )}
      >
        <Icon
          icon={locked ? 'lucide:lock' : 'lucide:check'}
          width={locked ? 11 : 12}
          height={locked ? 11 : 12}
        />
      </span>
    </label>
  )
}
