import clsx from 'clsx'
import { Icon } from '@iconify/react'
import Spinner from '@/components/ui/Spinner'

const base =
  'relative inline-flex shrink-0 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

const iconSizes = {
  sm: 18,
  md: 20,
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  accent: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80',
  secondary:
    'bg-white border border-gray-300 text-text hover:bg-gray-50 active:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
  ghost: 'text-gray-500 hover:bg-gray-100 hover:text-text',
  'ghost-danger': 'text-gray-500 hover:bg-red-50 hover:text-red-600',
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
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        base,
        sizes[size] ?? sizes.sm,
        variants[variant] ?? variants.secondary,
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <Icon
          icon={icon}
          width={iconSizes[size] ?? iconSizes.sm}
          height={iconSizes[size] ?? iconSizes.sm}
          aria-hidden
        />
      )}
    </button>
  )
}
