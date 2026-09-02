import { format } from 'date-fns'
import StatCard from '../../../components/ui/StatCard'
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

const goalColumns = [
  { key: 'title', header: 'Goal' },
  { key: 'targetDate', header: 'Target date' },
  { key: 'progress', header: 'Progress' },
]

export default function EmployeeDashboardView({ data }) {
  const {
    clockInStatus,
    leaveBalance,
    assignedTraining,
    goalProgress: goals = [],
  } = data

  const recent = assignedTraining?.recent ?? []

  const clockInText = clockInStatus?.hasClockedIn
    ? `Clocked in at ${fmt(clockInStatus.clockIn, 'p')}${
        clockInStatus.status ? ` (${clockInStatus.status})` : ''
      }`
    : 'Not clocked in yet today'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Today&rsquo;s attendance</p>
          <p className="mt-1 text-lg font-medium text-text">{clockInText}</p>
        </div>

        <StatCard
          value={leaveBalance?.remaining ?? '—'}
          label="Leave days remaining"
          tone="info"
        >
          {leaveBalance?.usedDays ?? 0} used of {leaveBalance?.totalDays ?? 0} total
        </StatCard>

        <StatCard value={assignedTraining?.count ?? 0} label="Assigned training">
          {recent.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4">
              {recent.map((doc, i) => (
                <li key={doc.id ?? i}>{doc.title || doc.name || 'Untitled document'}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Nothing assigned right now</span>
          )}
        </StatCard>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl text-primary">This month&rsquo;s goals</h2>
        <Table
          columns={goalColumns}
          rows={goals}
          emptyMessage="No goals set for you this month"
          renderRow={(goal, i) => (
            <tr key={goal.id ?? i} className="border-b border-gray-100 last:border-0">
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
