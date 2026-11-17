import clsx from 'clsx'

// On/off switch (role="switch"). `label` is the accessible name.
export default function Switch({ checked, disabled = false, onChange, label, title }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      title={title}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-(--duration-fast) focus-visible:focus-ring',
        checked ? 'bg-success' : 'bg-line-strong',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-(--duration-fast) motion-reduce:transition-none',
          checked ? 'translate-x-4.5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
