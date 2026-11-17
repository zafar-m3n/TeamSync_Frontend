import clsx from 'clsx'

const tones = {
  neutral: 'bg-surface-subtle text-fg-muted ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/20',
  danger: 'bg-danger-soft text-danger ring-danger/20',
  info: 'bg-info-soft text-info ring-info/20',
}

const dots = {
  neutral: 'bg-fg-subtle',
  brand: 'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

export default function Badge({ tone = 'neutral', dot = false, size = 'md', className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-px text-[11px]' : 'px-2.5 py-0.5 text-xs',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {dot && <span aria-hidden className={clsx('h-1.5 w-1.5 rounded-full', dots[tone] ?? dots.neutral)} />}
      {children}
    </span>
  )
}
