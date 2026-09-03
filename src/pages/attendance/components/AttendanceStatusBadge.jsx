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
      <Badge tone={TONE[status] ?? 'neutral'}>{status ?? '—'}</Badge>
      {isManualOverride && (
        <span
          title="Manually adjusted"
          aria-label="Manually adjusted"
          className="text-gray-400"
        >
          <Icon icon="lucide:pencil" width="14" height="14" />
        </span>
      )}
    </span>
  )
}
