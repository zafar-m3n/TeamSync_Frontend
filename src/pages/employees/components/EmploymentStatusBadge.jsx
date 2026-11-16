import Badge from '@/components/ui/Badge'
import { STATUS_TONE } from '@/pages/employees/utils/employmentStatus'

export default function EmploymentStatusBadge({ status }) {
  if (!status) return null
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status}</Badge>
}
