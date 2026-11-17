import clsx from 'clsx'

// Placeholder block. Size it with className (h-4 w-32, h-24 w-full…).
export default function Skeleton({ className }) {
  return <span aria-hidden="true" className={clsx('block animate-pulse rounded-md bg-surface-hover', className)} />
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <span aria-hidden="true" className={clsx('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={clsx('h-3', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </span>
  )
}

// Announces loading once for screen readers while skeletons are on screen.
export function LoadingRegion({ label = 'Loading', className, children }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  )
}
