import clsx from 'clsx'
import Spinner from '@/components/ui/Spinner'
import { buttonBase, buttonVariants } from '@/components/ui/buttonStyles'

const sizes = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-cell',
  md: 'h-9 gap-2 rounded-md px-4 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-sm',
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
      className={clsx(buttonBase, sizes[size] ?? sizes.md, buttonVariants[variant] ?? buttonVariants.primary, className)}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
      <span className={clsx('inline-flex items-center gap-[inherit]', isLoading && 'invisible')}>{children}</span>
    </button>
  )
}
