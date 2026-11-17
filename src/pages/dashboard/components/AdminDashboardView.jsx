import StatCard from '@/components/ui/StatCard'
import Table from '@/components/ui/Table'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ActivityFeedItem from '@/pages/dashboard/components/ActivityFeedItem'
import SystemCards from '@/pages/dashboard/components/SystemSection'
import WorkforceCards from '@/pages/dashboard/components/WorkforceSection'
import { CardLink, Panel } from '@/pages/dashboard/components/DashboardParts'
import { fmt } from '@/pages/dashboard/utils/dashboardFormat'
import { CountUp } from '@/hooks/useMotion'

const attendanceTone = { Present: 'success', Late: 'warning', Absent: 'danger' }
const attendanceIcon = { Present: 'lucide:user-check', Late: 'lucide:clock-alert', Absent: 'lucide:user-x' }

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

const departmentColumns = [
  { key: 'department', header: 'Department', className: 'font-medium', render: (r) => r.department?.name ?? 'Unassigned' },
  { key: 'count', header: 'Employees', align: 'right', className: 'tabular-nums' },
]

const upcomingLeaveColumns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  { key: 'leaveType', header: 'Leave type', render: (r) => r.leaveType?.name ?? '—' },
  { key: 'startDate', header: 'Start date', className: 'whitespace-nowrap tabular-nums', render: (r) => fmt(r.startDate, 'PP') },
]

const newHireColumns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.fullName ?? '—' },
  { key: 'employeeCode', header: 'Employee code', render: (r) => r.employeeCode ?? '—' },
  { key: 'designation', header: 'Designation', render: (r) => r.designation ?? '—' },
]

export default function AdminDashboardView({ data }) {
  const {
    orgAttendanceSnapshot = [],
    pendingLeaveApprovals,
    employeeCountByDepartment = [],
    recentActivityFeed = [],
  } = data

  const leaveItems = pendingLeaveApprovals?.items ?? []
  const upcomingLeaveItems = data.workforce?.upcomingLeave?.items ?? []
  const newHireItems = data.workforce?.newHires?.items ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orgAttendanceSnapshot.map((s) => (
          <CardLink key={s.status} to="/attendance">
            <StatCard
              value={<CountUp value={s.count} />}
              label={s.status}
              tone={attendanceTone[s.status] ?? 'neutral'}
              icon={attendanceIcon[s.status] ?? 'lucide:calendar-check'}
            />
          </CardLink>
        ))}
        <CardLink to="/leave">
          <StatCard
            value={<CountUp value={pendingLeaveApprovals?.total ?? 0} />}
            label="Awaiting approval"
            tone="warning"
            icon="lucide:hourglass"
          />
        </CardLink>
        {data.system && <SystemCards data={data.system} />}
        {data.workforce && <WorkforceCards data={data.workforce} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon="lucide:calendar-clock" title="Pending leave approvals" to="/leave">
          <Table columns={leaveColumns} rows={leaveItems} emptyMessage="No pending leave requests" emptyIcon="lucide:calendar-check-2" />
        </Panel>

        {data.workforce && (
          <>
            <Panel
              icon="lucide:calendar-plus"
              title="Upcoming Leave"
              count={data.workforce.upcomingLeave?.count ?? upcomingLeaveItems.length}
            >
              <Table
                columns={upcomingLeaveColumns}
                rows={upcomingLeaveItems}
                emptyMessage="No approved leave starting in the next 7 days."
                emptyIcon="lucide:calendar-x"
              />
            </Panel>

            <Panel icon="lucide:user-plus" title="New Hires This Month" count={data.workforce.newHires?.count ?? newHireItems.length}>
              <Table
                columns={newHireColumns}
                rows={newHireItems}
                emptyMessage="No new employees added this month."
                emptyIcon="lucide:user-round-plus"
              />
            </Panel>
          </>
        )}

        <Panel icon="lucide:building-2" title="Employees by department" to="/departments-shifts">
          <Table
            columns={departmentColumns}
            rows={employeeCountByDepartment}
            getRowKey={(r, i) => r.departmentId ?? `none-${i}`}
            emptyMessage="No departments yet"
            emptyIcon="lucide:building"
          />
        </Panel>
      </div>

      <Panel icon="lucide:history" title="Recent activity">
        <Card padding="none">
          {recentActivityFeed.length > 0 ? (
            <ul className="divide-y divide-line">
              {recentActivityFeed.map((item, i) => (
                <ActivityFeedItem key={i} item={item} />
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="lucide:history" message="No recent activity" />
          )}
        </Card>
      </Panel>
    </div>
  )
}
