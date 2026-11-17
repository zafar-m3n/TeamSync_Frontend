import clsx from 'clsx'

// Shared look for text-like controls (Input, Textarea, DatePicker trigger).
export function controlClass({ invalid = false, className } = {}) {
  return clsx(
    'block w-full rounded-md border bg-surface px-3 text-sm text-fg shadow-xs transition-[border-color,box-shadow] duration-(--duration-fast)',
    'placeholder:text-fg-subtle hover:border-fg-muted',
    'focus:outline-none focus-visible:outline-none focus:border-brand-600 focus:shadow-(--focus-ring)',
    'disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-subtle disabled:text-fg-muted disabled:shadow-none',
    invalid ? 'border-danger hover:border-danger focus:border-danger' : 'border-line-strong',
    className,
  )
}
