import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { useMyGoals } from '@/hooks/useMyGoals'

const LIMIT = 10

const columns = [
  { key: 'title', header: 'Title' },
  { key: 'targetDate', header: 'Target Date' },
  { key: 'numericTarget', header: 'Numeric Target' },
  { key: 'actualValue', header: 'Actual Value' },
  { key: 'progress', header: 'Progress' },
  { key: 'description', header: 'Description' },
]

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function pctLabel(value) {
  return `${Math.round(Number(value) || 0)}%`
}

export default function MyGoalsPage() {
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isError, error, refetch } = useMyGoals(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  if (isLoading) return <TableSkeleton columns={columns} rows={LIMIT} />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
        <p className="text-sm text-gray-600">
          {error?.message || 'Could not load your goals.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        rows={rows}
        emptyMessage="No goals assigned to you yet"
        renderRow={(goal) => (
          <tr
            key={goal.id}
            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <td className="px-4 py-3 text-text">{goal.title}</td>
            <td className="px-4 py-3 text-text">{fmtDate(goal.targetDate)}</td>
            <td className="px-4 py-3 text-text">{goal.numericTarget}</td>
            <td className="px-4 py-3 text-text">{goal.actualValue ?? '—'}</td>
            <td className="px-4 py-3">
              <ProgressBar
                value={goal.percentComplete}
                label={pctLabel(goal.percentComplete)}
              />
            </td>
            <td
              className="max-w-xs truncate px-4 py-3 text-text"
              title={goal.description || undefined}
            >
              {goal.description || '—'}
            </td>
          </tr>
        )}
      />

      {meta && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {meta.page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
