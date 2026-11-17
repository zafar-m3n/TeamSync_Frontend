import StatCard from '@/components/ui/StatCard'
import Table from '@/components/ui/Table'
import { CountUp } from '@/hooks/useMotion'
import { useAuth } from '@/store/useAuth'
import ClockPanel from '@/pages/attendance/components/ClockPanel'
import { CardLink, Panel } from '@/pages/dashboard/components/DashboardParts'
import { fmt, goalProgressText } from '@/pages/dashboard/utils/dashboardFormat'

const goalColumns = [
  { key: 'title', header: 'Goal', className: 'font-medium', render: (g) => g.title || '—' },
  { key: 'targetDate', header: 'Target date', className: 'whitespace-nowrap tabular-nums', render: (g) => fmt(g.targetDate, 'PP') },
  { key: 'progress', header: 'Progress', render: goalProgressText },
]

export default function EmployeeDashboardView({ data }) {
  const { can } = useAuth()
  const { clockInStatus, leaveBalance, assignedTraining, goalProgress: goals = [] } = data
  const recent = assignedTraining?.recent ?? []

  const clockInText = clockInStatus?.hasClockedIn
    ? `Clocked in at ${fmt(clockInStatus.clockIn, 'p')}${clockInStatus.status ? ` (${clockInStatus.status})` : ''}`
    : 'Not clocked in yet today'

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {can('attendance', 'clock') ? (
          <ClockPanel />
        ) : (
          <CardLink to="/my-attendance">
            <StatCard value={<span className="text-lg">{clockInText}</span>} label="Today’s attendance" icon="lucide:clock" />
          </CardLink>
        )}

        <CardLink to="/my-leave">
          <StatCard
            value={<CountUp value={leaveBalance?.remaining ?? '—'} />}
            label="Leave days remaining"
            tone="info"
            icon="lucide:calendar-days"
          >
            {leaveBalance?.usedDays ?? 0} used of {leaveBalance?.totalDays ?? 0} total
          </StatCard>
        </CardLink>

        <CardLink to="/my-training">
          <StatCard value={<CountUp value={assignedTraining?.count ?? 0} />} label="Assigned training" icon="lucide:graduation-cap">
            {recent.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-fg">
                {recent.map((doc, i) => (
                  <li key={doc.id ?? i}>{doc.title || doc.name || 'Untitled document'}</li>
                ))}
              </ul>
            ) : (
              <span>Nothing assigned right now</span>
            )}
          </StatCard>
        </CardLink>
      </div>

      <Panel icon="lucide:target" title="This month’s goals" to="/my-goals">
        <Table columns={goalColumns} rows={goals} emptyMessage="No goals set for you this month" emptyIcon="lucide:target" />
      </Panel>
    </div>
  )
}
