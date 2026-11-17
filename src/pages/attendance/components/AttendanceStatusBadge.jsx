import { Icon } from '@iconify/react'
import Badge from '@/components/ui/Badge'

const TONE = {
  Present: 'success',
  Late: 'warning',
  'Half-day': 'info',
  Absent: 'danger',
}

export default function AttendanceStatusBadge({ status, isManualOverride }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge dot tone={TONE[status] ?? 'neutral'}>
        {status ?? '—'}
      </Badge>
      {isManualOverride && (
        <span
          title="Manually adjusted"
          aria-label="Manually adjusted"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-hover text-fg-muted"
        >
          <Icon icon="lucide:pencil" width="11" height="11" aria-hidden />
        </span>
      )}
    </span>
  )
}
