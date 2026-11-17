import { Icon } from '@iconify/react'
import clsx from 'clsx'
import SpotlightCard from '@/components/motion/reactbits/SpotlightCard'

const toneText = {
  neutral: 'text-fg',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  brand: 'text-brand-700',
}

const toneIcon = {
  neutral: 'bg-surface-subtle text-fg-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  brand: 'bg-brand-50 text-brand-700',
}

// The spotlight follows the pointer only while it is over the card (proximity 0),
// and stands still under reduced motion.
const SPOTLIGHT_VARS = {
  '--spotlight-card-surface': 'var(--color-surface)',
  '--spotlight-card-border': 'var(--color-line)',
  '--spotlight-card-shadow': 'var(--shadow-sm)',
}

/**
 * KPI tile. `accent` adds the brand top rule used for role-specific cards.
 * `children` renders under the label (sub-text, a progress bar…).
 */
export default function StatCard({ value, label, tone = 'neutral', icon, accent = false, className, children }) {
  return (
    <SpotlightCard
      theme="light"
      spotlightColor="#008f8b"
      intensity={0.35}
      borderGlow={0.5}
      spotlightSize={220}
      proximity={0}
      flare={false}
      style={SPOTLIGHT_VARS}
      className={clsx('h-full rounded-lg p-5', className)}
    >
      {accent && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-brand-500" />}
      <div className="flex items-start justify-between gap-3">
        <p className="text-cell font-medium text-fg-muted">{label}</p>
        {icon && (
          <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', toneIcon[tone] ?? toneIcon.neutral)}>
            <Icon icon={icon} width="16" height="16" aria-hidden />
          </span>
        )}
      </div>
      <p className={clsx('text-display mt-1 text-3xl font-semibold tabular-nums', toneText[tone] ?? toneText.neutral)}>{value}</p>
      {children != null && <div className="mt-3 text-cell text-fg-muted">{children}</div>}
    </SpotlightCard>
  )
}
