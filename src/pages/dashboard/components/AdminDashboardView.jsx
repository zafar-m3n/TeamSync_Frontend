import { format } from 'date-fns'
import StatCard from '../../../components/ui/StatCard'
import Table from '../../../components/ui/Table'
import ActivityFeedItem from './ActivityFeedItem'

function fmt(value, pattern) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern)
}

const attendanceTone = { Present: 'success', Late: 'warning', Absent: 'danger' }

const leaveColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'leaveType', header: 'Leave type' },
  { key: 'dates', header: 'Dates' },
]

const departmentColumns = [
  { key: 'department', header: 'Department' },
  { key: 'count', header: 'Employees' },
]

export default function AdminDashboardView({ data }) {
  const {
    orgAttendanceSnapshot = [],
    pendingLeaveApprovals,
    employeeCountByDepartment = [],
    recentActivityFeed = [],
  } = data

  const leaveItems = pendingLeaveApprovals?.items ?? []

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-xl text-primary">Attendance today</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {orgAttendanceSnapshot.map((s) => (
            <StatCard
              key={s.status}
              value={s.count}
              label={s.status}
              tone={attendanceTone[s.status] ?? 'neutral'}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-primary">Pending leave approvals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value={pendingLeaveApprovals?.total ?? 0}
            label="Awaiting approval"
            tone="warning"
          />
        </div>
        <Table
          columns={leaveColumns}
          rows={leaveItems}
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
        <h2 className="mb-3 font-display text-xl text-primary">Employees by department</h2>
        <Table
          columns={departmentColumns}
          rows={employeeCountByDepartment}
          emptyMessage="No departments yet"
          renderRow={(row, i) => (
            <tr key={row.departmentId ?? i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-text">{row.department?.name ?? 'Unassigned'}</td>
              <td className="px-4 py-3 text-text">{row.count}</td>
            </tr>
          )}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-primary">Recent activity</h2>
        {recentActivityFeed.length > 0 ? (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {recentActivityFeed.map((item, i) => (
              <ActivityFeedItem key={i} item={item} />
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            No recent activity
          </div>
        )}
      </section>
    </div>
  )
}
