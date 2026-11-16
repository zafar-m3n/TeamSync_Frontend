import IconButton from '@/components/ui/IconButton'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'

function getInitials(source) {
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, className = 'h-8 w-8 text-xs' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}

export function NameCell({ name }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar name={name} />
      <span className="font-medium text-text">{name ?? '—'}</span>
    </span>
  )
}

export function RowActions({ empId, navigate, className, onDelete }) {
  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <IconButton
        icon="lucide:eye"
        label="View employee"
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          navigate(String(empId))
        }}
      />
      <IconButton
        icon="lucide:pencil"
        label="Edit employee"
        variant="secondary"
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
          variant="danger"
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

export function ListSkeleton({ columns, rows }) {
  return (
    <>
      <div className="hidden md:block">
        <TableSkeleton columns={columns} rows={rows} />
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    </>
  )
}

export function ListError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
