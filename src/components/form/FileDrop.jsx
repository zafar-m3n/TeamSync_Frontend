import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useFieldProps } from '@/components/form/fieldContext'

/**
 * Click-to-choose file picker styled as a drop zone. The real <input type="file">
 * stays in the DOM (visually hidden) for keyboard and assistive tech.
 * `file` is the chosen File (or null); `onChange` gets the input's change event.
 */
export default function FileDrop({ file, onChange, accept, hint, invalid, inputRef, ...props }) {
  const field = useFieldProps({ invalid, ...props })
  const bad = field.invalid

  return (
    <label
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors duration-(--duration-fast) focus-within:focus-ring',
        bad
          ? 'border-danger bg-danger-soft/40'
          : file
            ? 'border-brand-500 bg-brand-50'
            : 'border-line-strong bg-surface-subtle hover:border-brand-500 hover:bg-brand-50/60',
      )}
    >
      <span
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-full',
          file && !bad ? 'bg-brand-100 text-brand-700' : 'bg-surface text-fg-muted ring-1 ring-line',
        )}
      >
        <Icon icon={file ? 'lucide:file-check-2' : 'lucide:cloud-upload'} width="20" height="20" aria-hidden />
      </span>
      <span className="max-w-full truncate text-sm font-medium text-fg">{file ? file.name : 'Click to choose a file'}</span>
      {hint && <span className="text-xs text-fg-muted">{hint}</span>}
      <input
        ref={inputRef}
        type="file"
        id={field.id}
        accept={accept}
        aria-invalid={bad || undefined}
        aria-describedby={field.describedBy}
        className="sr-only"
        onChange={onChange}
      />
    </label>
  )
}
