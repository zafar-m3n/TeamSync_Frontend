import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Icon } from '@iconify/react'
import Badge from '../../../components/ui/Badge'

const TYPES = {
  employee_created: { icon: 'lucide:user-plus', tone: 'success', label: 'New employee' },
  leave_requested: { icon: 'lucide:calendar-plus', tone: 'info', label: 'Leave request' },
  training_assigned: { icon: 'lucide:graduation-cap', tone: 'neutral', label: 'Training' },
}

function personName(data) {
  return (
    data?.employee?.fullName ||
    data?.fullName ||
    data?.employeeName ||
    data?.name ||
    'Someone'
  )
}

function describe(type, data) {
  switch (type) {
    case 'employee_created':
      return `${personName(data)} was added`
    case 'leave_requested':
      return `Leave requested by ${personName(data)}`
    case 'training_assigned':
      return `Training assigned to ${personName(data)}`
    default:
      return type ? type.replace(/_/g, ' ') : 'Activity'
  }
}

function relative(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return Number.isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
}

// Route each item by type. Only employee_created has a real per-record
// destination; the other two land on their general list page (no per-request
// or per-assignment detail route exists in the backend).
function targetFor(item, base) {
  if (item.type === 'employee_created' && item.data?.id != null) {
    return `${base}/employees/${item.data.id}`
  }
  if (item.type === 'leave_requested') return `${base}/leave`
  if (item.type === 'training_assigned') return `${base}/training`
  return null
}

export default function ActivityFeedItem({ item, base }) {
  const meta =
    TYPES[item.type] ?? { icon: 'lucide:activity', tone: 'neutral', label: item.type }
  const to = base ? targetFor(item, base) : null

  const body = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <Icon icon={meta.icon} width="16" height="16" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <span className="text-xs text-gray-400">{relative(item.timestamp)}</span>
        </div>
        <p className="mt-1 text-sm text-text">{describe(item.type, item.data)}</p>
      </div>
    </>
  )

  return (
    <li>
      {to ? (
        <Link
          to={to}
          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  )
}
