export const buttonBase =
  'relative inline-flex shrink-0 select-none items-center justify-center font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-(--duration-fast) focus:outline-none focus-visible:focus-ring active:translate-y-px disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:translate-y-0'

// Shared by Button (filled/outlined) and IconButton.
export const buttonVariants = {
  primary: 'bg-brand-600 text-on-brand shadow-xs hover:bg-brand-700',
  secondary: 'border border-line-strong/70 bg-surface text-fg shadow-xs hover:bg-surface-subtle hover:border-fg-subtle',
  danger: 'bg-danger-solid text-white shadow-xs hover:bg-danger-strong',
  success: 'bg-success text-white shadow-xs hover:bg-success-strong',
  dark: 'bg-ink text-white shadow-xs hover:bg-ink-hover',
  ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg',
  'ghost-danger': 'text-fg-muted hover:bg-danger-soft hover:text-danger',
}
