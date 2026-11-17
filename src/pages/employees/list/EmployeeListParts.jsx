import IconButton from '@/components/ui/IconButton'
import Avatar from '@/components/ui/Avatar'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'

export function NameCell({ name, sub }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar name={name} />
      <span className="min-w-0">
        <span className="block truncate font-medium text-fg">{name ?? '—'}</span>
        {sub && <span className="block truncate text-xs text-fg-muted">{sub}</span>}
      </span>
    </span>
  )
}

export function RowActions({ empId, navigate, className, onDelete }) {
  return (
    <div className={`flex gap-1 ${className ?? ''}`}>
      <IconButton
        icon="lucide:eye"
        label="View employee"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          navigate(String(empId))
        }}
      />
      <IconButton
        icon="lucide:pencil"
        label="Edit employee"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`${empId}/edit`)
        }}
      />
      {onDelete && (
        <IconButton
          icon="lucide:trash-2"
          label="Delete employee"
          variant="ghost-danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        />
      )}
    </div>
  )
}

// Phone-width card shell; the whole card opens the employee.
export function MobileCard({ onOpen, children }) {
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer rounded-lg border border-line bg-surface p-4 shadow-sm transition-colors duration-(--duration-fast) hover:bg-surface-subtle"
    >
      {children}
    </div>
  )
}

// Loading / error / empty for the phone-width card list (the table handles its own).
export function MobileListState({ isLoading, error, onRetry, rows, emptyMessage, emptyAction }) {
  if (isLoading) {
    return (
      <LoadingRegion label="Loading employees" className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </LoadingRegion>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg border border-line bg-surface shadow-sm">
        <ErrorState compact message={error} onRetry={onRetry} />
      </div>
    )
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface shadow-sm">
        <EmptyState compact icon="lucide:users" message={emptyMessage} action={emptyAction} />
      </div>
    )
  }
  return null
}
