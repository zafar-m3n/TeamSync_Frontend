import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import { Panel } from '@/pages/dashboard/components/DashboardParts'
import { fmt, goalProgressText } from '@/pages/dashboard/utils/dashboardFormat'
import { CountUp } from '@/hooks/useMotion'

const attendanceTone = { Present: 'success', Late: 'warning', Absent: 'danger' }

const attendanceColumns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <Badge dot tone={attendanceTone[r.status] ?? 'neutral'}>
        {r.status ?? '—'}
      </Badge>
    ),
  },
  { key: 'clockIn', header: 'Clock-in', className: 'whitespace-nowrap tabular-nums', render: (r) => fmt(r.clockIn, 'p') },
]

const leaveColumns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  { key: 'leaveType', header: 'Leave type', render: (r) => r.leaveType?.name ?? '—' },
  {
    key: 'dates',
    header: 'Dates',
    className: 'whitespace-nowrap tabular-nums',
    render: (r) => (
      <>
        {fmt(r.startDate, 'PP')} &ndash; {fmt(r.endDate, 'PP')}
      </>
    ),
  },
]

const goalColumns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (g) => g.employee?.fullName ?? '—' },
  { key: 'title', header: 'Goal', render: (g) => g.title || '—' },
  { key: 'targetDate', header: 'Target date', className: 'whitespace-nowrap tabular-nums', render: (g) => fmt(g.targetDate, 'PP') },
  { key: 'progress', header: 'Progress', render: goalProgressText },
]

export default function ManagerDashboardView({ data }) {
  const { teamAttendanceToday = [], pendingLeaveApprovals = [], teamGoalProgress = [] } = data

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        icon="lucide:calendar-clock"
        title="Pending leave approvals"
        count={<CountUp value={pendingLeaveApprovals.length} />}
        to="/team-leave"
      >
        <Table columns={leaveColumns} rows={pendingLeaveApprovals} emptyMessage="No pending leave requests" emptyIcon="lucide:calendar-check-2" />
      </Panel>

      <Panel icon="lucide:calendar-check" title="Team attendance today" to="/team-attendance">
        <Table
          columns={attendanceColumns}
          rows={teamAttendanceToday}
          emptyMessage="No attendance recorded for your team today"
          emptyIcon="lucide:calendar-x"
        />
      </Panel>

      <Panel icon="lucide:target" title="Team goal progress" to="/team-goals" className="lg:col-span-2">
        <Table columns={goalColumns} rows={teamGoalProgress} emptyMessage="No goals set for your team this month" emptyIcon="lucide:target" />
      </Panel>
    </div>
  )
}
