import { useState } from 'react'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useShifts } from '@/hooks/useShifts'
import ShiftFormModal from '@/pages/departments-shifts/components/ShiftFormModal'

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'endTime', header: 'End Time' },
  { key: 'grace', header: 'Grace Period' },
  { key: 'days', header: 'Working Days' },
  { key: 'actions', header: 'Actions' },
]

function formatDays(days) {
  if (!days?.length) return '—'
  return DAY_ORDER.filter((d) => days.includes(d)).join(', ')
}

export default function ShiftsTab() {
  const { data: shifts, isLoading, isError, error, refetch } = useShifts()
  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit

  const openCreate = () => setFormTarget(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={openCreate}>
          New Shift
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load shifts.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={shifts ?? []}
          emptyMessage="No shifts yet — add your first shift"
          emptyAction={
            <Button variant="accent" size="sm" onClick={openCreate}>
              New Shift
            </Button>
          }
          renderRow={(shift) => (
            <tr
              key={shift.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">{shift.name}</td>
              <td className="px-4 py-3 text-text">
                {(shift.startTime ?? '').slice(0, 5) || '—'}
              </td>
              <td className="px-4 py-3 text-text">
                {(shift.endTime ?? '').slice(0, 5) || '—'}
              </td>
              <td className="px-4 py-3 text-text">
                {shift.gracePeriodMinutes ?? 0} min
              </td>
              <td className="px-4 py-3 text-text">{formatDays(shift.workingDays)}</td>
              <td className="px-4 py-3">
                <IconButton
                  icon="lucide:pencil"
                  label="Edit shift"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormTarget(shift)}
                />
              </td>
            </tr>
          )}
        />
      )}

      {formTarget !== undefined && (
        <ShiftFormModal
          key={formTarget?.id ?? 'new'}
          shift={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}
    </div>
  )
}
