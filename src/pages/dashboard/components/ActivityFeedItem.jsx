import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Badge from '@/components/ui/Badge'

const TYPES = {
  employee_created: { icon: 'lucide:user-plus', tone: 'success', label: 'New employee' },
  leave_requested: { icon: 'lucide:calendar-plus', tone: 'info', label: 'Leave request' },
  training_assigned: { icon: 'lucide:graduation-cap', tone: 'neutral', label: 'Training' },
}

const iconTone = {
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-subtle text-fg-muted',
}

function personName(data) {
  return data?.employee?.fullName || data?.fullName || data?.employeeName || data?.name || 'Someone'
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
function targetFor(item) {
  if (item.type === 'employee_created' && item.data?.id != null) {
    return `/employees/${item.data.id}`
  }
  if (item.type === 'leave_requested') return '/leave'
  if (item.type === 'training_assigned') return '/training'
  return null
}

export default function ActivityFeedItem({ item }) {
  const meta = TYPES[item.type] ?? { icon: 'lucide:activity', tone: 'neutral', label: item.type }
  const to = targetFor(item)

  const body = (
    <>
      <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', iconTone[meta.tone] ?? iconTone.neutral)}>
        <Icon icon={meta.icon} width="16" height="16" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-fg">{describe(item.type, item.data)}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge size="sm" tone={meta.tone}>
            {meta.label}
          </Badge>
          <span className="text-xs text-fg-subtle">{relative(item.timestamp)}</span>
        </div>
      </div>
      {to && <Icon icon="lucide:chevron-right" width="16" height="16" aria-hidden className="self-center text-fg-subtle" />}
    </>
  )

  return (
    <li>
      {to ? (
        <Link
          to={to}
          className="flex items-start gap-3 px-4 py-3 transition-colors duration-(--duration-fast) hover:bg-surface-subtle focus-visible:focus-ring focus-visible:rounded-md"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  )
}
