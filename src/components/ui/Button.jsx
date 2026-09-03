import clsx from 'clsx'
import Spinner from '@/components/ui/Spinner'

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  accent: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80',
  secondary:
    'bg-white border border-gray-300 text-text hover:bg-gray-50 active:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
  dark: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(base, sizes[size] ?? sizes.md, variants[variant] ?? variants.primary, className)}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
      <span className={clsx('inline-flex items-center gap-2', isLoading && 'invisible')}>
        {children}
      </span>
    </button>
  )
}
