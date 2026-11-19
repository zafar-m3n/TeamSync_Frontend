import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { setTheme, useTheme } from '@/lib/theme'

// Light / dark switch for the topbar. The knob carries a sun or moon and slides
// to the side of the active theme.
export default function ThemeToggle() {
  const dark = useTheme() === 'dark'
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={label}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-line bg-surface-subtle transition-colors duration-(--duration-fast) hover:border-line-strong focus-visible:focus-ring"
    >
      {/* Faint icons on the track show both choices. */}
      <Icon icon="lucide:sun" width="14" height="14" aria-hidden className="absolute left-2 text-fg-subtle" />
      <Icon icon="lucide:moon" width="14" height="14" aria-hidden className="absolute right-2 text-fg-subtle" />
      <span
        aria-hidden
        className={clsx(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-fg shadow-sm ring-1 ring-line transition-transform duration-(--duration-base) ease-out motion-reduce:transition-none',
          dark ? 'translate-x-[1.625rem]' : 'translate-x-[0.1875rem]',
        )}
      >
        <Icon icon={dark ? 'lucide:moon' : 'lucide:sun'} width="14" height="14" className={dark ? 'text-brand-700' : 'text-warning'} />
      </span>
    </button>
  )
}
