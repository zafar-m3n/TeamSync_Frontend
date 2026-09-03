import Badge from '../../../components/ui/Badge'

const TONE = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Cancelled: 'neutral',
}

export default function LeaveStatusBadge({ status }) {
  return <Badge tone={TONE[status] ?? 'neutral'}>{status ?? '—'}</Badge>
}
