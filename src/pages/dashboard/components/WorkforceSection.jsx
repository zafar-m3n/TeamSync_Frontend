import { format } from 'date-fns'
import StatCard from '@/components/ui/StatCard'
import Table from '@/components/ui/Table'

function fmt(value, pattern) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern)
}

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

export default function WorkforceSection({ data }) {
  const {
    weeklyAttendanceRate,
    monthlyAttendanceRate,
    upcomingLeave = { count: 0, items: [] },
    newHires = { count: 0, items: [] },
  } = data

  const upcomingLeaveItems = upcomingLeave?.items ?? []
  const newHireItems = newHires?.items ?? []

  return (
    <section className="space-y-8">
      <div>
        <h2 className="mb-3 text-xl text-primary">Workforce</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value={`${weeklyAttendanceRate}%`} label="Weekly Attendance Rate" />
          <StatCard value={`${monthlyAttendanceRate}%`} label="Monthly Attendance Rate" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-text">
          Upcoming Leave ({upcomingLeave?.count ?? upcomingLeaveItems.length})
        </h3>
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
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-text">
          New Hires This Month ({newHires?.count ?? newHireItems.length})
        </h3>
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
      </div>
    </section>
  )
}
