import { format } from 'date-fns'
import Badge from '../../../components/ui/Badge'
import Table from '../../../components/ui/Table'

function fmt(value, pattern) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern)
}

function goalProgressText(goal) {
  if (goal.status) return goal.status
  if (typeof goal.progressPercentage === 'number') return `${goal.progressPercentage}%`
  if (goal.targetValue != null && goal.actualValue != null) {
    return `${goal.actualValue} / ${goal.targetValue}`
  }
  return '—'
}

const attendanceTone = { Present: 'success', Late: 'warning', Absent: 'danger' }

const attendanceColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'status', header: 'Status' },
  { key: 'clockIn', header: 'Clock-in' },
]

const leaveColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'leaveType', header: 'Leave type' },
  { key: 'dates', header: 'Dates' },
]

const goalColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'title', header: 'Goal' },
  { key: 'targetDate', header: 'Target date' },
  { key: 'progress', header: 'Progress' },
]

export default function ManagerDashboardView({ data }) {
  const {
    teamAttendanceToday = [],
    pendingLeaveApprovals = [],
    teamGoalProgress = [],
  } = data

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-xl text-primary">Team attendance today</h2>
        <Table
          columns={attendanceColumns}
          rows={teamAttendanceToday}
          emptyMessage="No attendance recorded for your team today"
          renderRow={(rec, i) => (
            <tr key={rec.id ?? i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-text">{rec.employee?.fullName ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge tone={attendanceTone[rec.status] ?? 'neutral'}>
                  {rec.status ?? '—'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-text">{fmt(rec.clockIn, 'p')}</td>
            </tr>
          )}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-xl text-primary">Pending leave approvals</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {pendingLeaveApprovals.length}
          </span>
        </div>
        <Table
          columns={leaveColumns}
          rows={pendingLeaveApprovals}
          emptyMessage="No pending leave requests"
          renderRow={(req, i) => (
            <tr key={req.id ?? i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-text">{req.employee?.fullName ?? '—'}</td>
              <td className="px-4 py-3 text-text">{req.leaveType?.name ?? '—'}</td>
              <td className="px-4 py-3 text-text">
                {fmt(req.startDate, 'PP')} &ndash; {fmt(req.endDate, 'PP')}
              </td>
            </tr>
          )}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-primary">Team goal progress</h2>
        <Table
          columns={goalColumns}
          rows={teamGoalProgress}
          emptyMessage="No goals set for your team this month"
          renderRow={(goal, i) => (
            <tr key={goal.id ?? i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-text">{goal.employee?.fullName ?? '—'}</td>
              <td className="px-4 py-3 text-text">{goal.title || '—'}</td>
              <td className="px-4 py-3 text-text">{fmt(goal.targetDate, 'PP')}</td>
              <td className="px-4 py-3 text-text">{goalProgressText(goal)}</td>
            </tr>
          )}
        />
      </section>
    </div>
  )
}
