import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'
import ProgressBar from '@/components/ui/ProgressBar'

// Whole-card link around a StatCard.
export function CardLink({ to, children }) {
  return (
    <Link to={to} className="block h-full rounded-lg transition-transform duration-(--duration-fast) hover:-translate-y-px focus-visible:focus-ring">
      {children}
    </Link>
  )
}

// Heading row + content for a dashboard widget.
export function Panel({ icon, title, count, to, className, children }) {
  return (
    <section className={clsx('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold text-fg">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-fg-muted ring-1 ring-line">
            <Icon icon={icon} width="15" height="15" aria-hidden />
          </span>
          <span className="truncate">{title}</span>
          {count != null && (
            <span className="rounded-full bg-surface-hover px-2 py-px text-xs font-medium tabular-nums text-fg-muted">{count}</span>
          )}
        </h2>
        {to && (
          <Link
            to={to}
            className="inline-flex shrink-0 items-center gap-1 rounded text-cell font-medium text-brand-700 transition-colors hover:text-brand-600 focus-visible:focus-ring"
          >
            View all
            <Icon icon="lucide:arrow-right" width="14" height="14" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="mt-2 h-8 w-16" />
    </div>
  )
}

function PanelSkeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-48" />
      <div className="rounded-lg border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-surface-subtle px-4 py-3">
          <Skeleton className="h-2.5 w-40" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-6 border-b border-line px-4 py-3.5 last:border-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Shown while the dashboard request is in flight (the layout isn't known yet).
export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading dashboard" className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </LoadingRegion>
  )
}

// Goal progress cell; matches the progress bar on the Goals pages.
export function GoalProgress({ goal }) {
  const pct = Number(goal.percentComplete) || 0
  return <ProgressBar value={pct} label={`${Math.round(pct)}%`} />
}
