import clsx from 'clsx'
import { Icon } from '@iconify/react'
import Spinner from '@/components/ui/Spinner'
import { buttonBase } from '@/components/ui/buttonStyles'

const sizes = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-9 w-9 rounded-md',
  lg: 'h-11 w-11 rounded-lg',
}

const iconSizes = { sm: 16, md: 18, lg: 20 }

// Row actions sit in dense tables, so coloured variants are tinted rather than solid.
const variants = {
  primary: 'bg-brand-600 text-on-brand hover:bg-brand-700',
  accent: 'border border-brand-100 bg-brand-50 text-brand-700 hover:border-brand-500/40 hover:bg-brand-100',
  secondary: 'border border-line-strong/70 bg-surface text-fg-muted hover:bg-surface-subtle hover:text-fg',
  danger: 'border border-danger/20 bg-danger-soft text-danger hover:border-danger/40 hover:bg-danger/15',
  success: 'border border-success/20 bg-success-soft text-success hover:border-success/40 hover:bg-success/15',
  ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg',
  'ghost-danger': 'text-fg-muted hover:bg-danger-soft hover:text-danger',
}

// Icon-only button. `label` is required — it drives the accessible name and the
// hover tooltip since there is no visible text.
export default function IconButton({
  icon,
  label,
  variant = 'secondary',
  size = 'sm',
  type = 'button',
  isLoading = false,
  disabled = false,
  className,
  ...props
}) {
  const px = iconSizes[size] ?? iconSizes.sm
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(buttonBase, sizes[size] ?? sizes.sm, variants[variant] ?? variants.secondary, className)}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : <Icon icon={icon} width={px} height={px} aria-hidden />}
    </button>
  )
}
