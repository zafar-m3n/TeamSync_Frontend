import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import StatCard from '@/components/ui/StatCard'
import Table from '@/components/ui/Table'
import ActivityFeedItem from '@/pages/dashboard/components/ActivityFeedItem'
import SystemCards from '@/pages/dashboard/components/SystemSection'
import WorkforceCards from '@/pages/dashboard/components/WorkforceSection'
import { CountUp } from '@/hooks/useCountUp'
import { useAuth } from '@/store/AuthContext'

const CARD_LINK =
  'block rounded-lg transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
const HEADER_LINK =
  'rounded text-sm font-medium text-accent transition-colors hover:text-accent/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

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

const upcomingLeaveColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'leaveType', header: 'Leave type' },
  { key: 'startDate', header: 'Start date' },
]

const newHireColumns = [
  { key: 'employee', header: 'Employee' },
  { key: 'employeeCode', header: 'Employee code' },
  { key: 'designation', header: 'Designation' },
]

function SectionHeading({ icon, children, to }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-xl text-primary">
        <Icon icon={icon} width="20" height="20" className="text-gray-400" />
        {children}
      </h2>
      {to && (
        <Link to={to} className={HEADER_LINK}>
          View all
        </Link>
      )}
    </div>
  )
}

// One cell of the tables grid. `min-w-0` lets the Table's own overflow-x-auto
// handle narrow columns instead of blowing out the grid track.
function TablePanel({ icon, title, to, children }) {
  return (
    <div className="min-w-0">
      <SectionHeading icon={icon} to={to}>
        {title}
      </SectionHeading>
      {children}
    </div>
  )
}

export default function AdminDashboardView({ data }) {
  const { user } = useAuth()
  const base = `/${user.roleName.toLowerCase()}`

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
    <div className="space-y-8">
      {/* 1. Unified KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orgAttendanceSnapshot.map((s) => (
          <Link key={s.status} to={`${base}/attendance`} className={CARD_LINK}>
            <StatCard
              value={<CountUp value={s.count} />}
              label={s.status}
              tone={attendanceTone[s.status] ?? 'neutral'}
            />
          </Link>
        ))}
        <Link to={`${base}/leave`} className={CARD_LINK}>
          <StatCard
            value={<CountUp value={pendingLeaveApprovals?.total ?? 0} />}
            label="Awaiting approval"
            tone="warning"
          />
        </Link>
        {data.system && <SystemCards data={data.system} />}
        {data.workforce && <WorkforceCards data={data.workforce} />}
      </div>

      {/* 2. Tables — Admin: 2-up · HR: 2x2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TablePanel
          icon="lucide:calendar-clock"
          title="Pending leave approvals"
          to={`${base}/leave`}
        >
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
        </TablePanel>

        {data.workforce && (
          <>
            <TablePanel
              icon="lucide:calendar-plus"
              title={`Upcoming Leave (${data.workforce.upcomingLeave?.count ?? upcomingLeaveItems.length})`}
            >
              <Table
                columns={upcomingLeaveColumns}
                rows={upcomingLeaveItems}
                emptyMessage="No approved leave starting in the next 7 days."
                renderRow={(item, i) => (
                  <tr key={item.id ?? i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-text">{item.employee?.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-text">{item.leaveType?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text">{fmt(item.startDate, 'PP')}</td>
                  </tr>
                )}
              />
            </TablePanel>

            <TablePanel
              icon="lucide:user-plus"
              title={`New Hires This Month (${data.workforce.newHires?.count ?? newHireItems.length})`}
            >
              <Table
                columns={newHireColumns}
                rows={newHireItems}
                emptyMessage="No new employees added this month."
                renderRow={(item, i) => (
                  <tr key={item.id ?? i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-text">{item.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-text">{item.employeeCode ?? '—'}</td>
                    <td className="px-4 py-3 text-text">{item.designation ?? '—'}</td>
                  </tr>
                )}
              />
            </TablePanel>
          </>
        )}

        <TablePanel
          icon="lucide:building-2"
          title="Employees by department"
          to={`${base}/departments-shifts`}
        >
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
        </TablePanel>
      </div>

      {/* 3. History */}
      <section>
        <SectionHeading icon="lucide:history">Recent activity</SectionHeading>
        {recentActivityFeed.length > 0 ? (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {recentActivityFeed.map((item, i) => (
              <ActivityFeedItem key={i} item={item} base={base} />
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
