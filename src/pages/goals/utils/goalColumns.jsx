import { format } from 'date-fns'
import ProgressBar from '@/components/ui/ProgressBar'

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

const pct = (value) => Number(value) || 0

// Columns shared by My, Team and All Goals; `withEmployee` adds the Employee column first.
export function goalColumns({ withEmployee = false } = {}) {
  return [
    ...(withEmployee
      ? [{ key: 'employee', header: 'Employee', className: 'whitespace-nowrap font-medium', render: (g) => g.employee?.fullName ?? '—' }]
      : []),
    { key: 'title', header: 'Title', className: withEmployee ? 'min-w-32' : 'min-w-32 font-medium' },
    { key: 'targetDate', header: 'Target Date', className: 'whitespace-nowrap tabular-nums', render: (g) => fmtDate(g.targetDate) },
    { key: 'numericTarget', header: 'Numeric Target', align: 'right', className: 'tabular-nums' },
    {
      key: 'actualValue',
      header: 'Actual Value',
      align: 'right',
      className: 'tabular-nums',
      render: (g) => g.actualValue ?? <span className="text-fg-subtle">—</span>,
    },
    {
      key: 'progress',
      header: 'Progress',
      className: 'min-w-36',
      render: (g) => (
        <ProgressBar
          value={g.percentComplete}
          tone={pct(g.percentComplete) >= 100 ? 'success' : 'accent'}
          label={`${Math.round(pct(g.percentComplete))}%`}
        />
      ),
    },
    {
      key: 'description',
      header: 'Description',
      className: 'text-fg-muted',
      render: (g) =>
        g.description ? (
          <span title={g.description} className="block max-w-48 truncate">
            {g.description}
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ]
}
