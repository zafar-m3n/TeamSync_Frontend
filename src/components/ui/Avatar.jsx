import clsx from 'clsx'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}

function getInitials(source) {
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Initials in a brand-tinted circle. Decorative: the name is always shown next to it.
export default function Avatar({ name, size = 'sm', className }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'flex shrink-0 select-none items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-100',
        SIZES[size] ?? SIZES.sm,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
