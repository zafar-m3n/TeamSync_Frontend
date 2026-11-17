import { useState } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Table from '@/components/ui/Table'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useShifts } from '@/hooks/useShifts'
import { useDeleteShift } from '@/hooks/useShift'
import ShiftFormModal from '@/pages/departments-shifts/components/ShiftFormModal'

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatDays(days) {
  if (!days?.length) return '—'
  return DAY_ORDER.filter((d) => days.includes(d)).join(', ')
}

// Seven day pills with the working ones filled; the text list is kept for screen readers.
function WorkingDays({ days }) {
  if (!days?.length) return <span className="text-fg-subtle">—</span>
  return (
    <>
      <span className="sr-only">{formatDays(days)}</span>
      <span aria-hidden className="flex gap-1">
        {DAY_ORDER.map((d) => {
          const on = days.includes(d)
          return (
            <span
              key={d}
              className={clsx(
                'flex h-6 w-7 items-center justify-center rounded text-[11px] font-medium',
                on ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' : 'text-fg-subtle',
              )}
            >
              {d.slice(0, 2)}
            </span>
          )
        })}
      </span>
    </>
  )
}

const hhmm = (t) => (t ?? '').slice(0, 5) || '—'

const columns = [
  { key: 'name', header: 'Name', className: 'font-medium' },
  { key: 'startTime', header: 'Start Time', className: 'tabular-nums', render: (s) => hhmm(s.startTime) },
  { key: 'endTime', header: 'End Time', className: 'tabular-nums', render: (s) => hhmm(s.endTime) },
  { key: 'grace', header: 'Grace Period', className: 'tabular-nums text-fg-muted', render: (s) => `${s.gracePeriodMinutes ?? 0} min` },
  { key: 'days', header: 'Working Days', render: (s) => <WorkingDays days={s.workingDays} /> },
]

export default function ShiftsTab() {
  const { data: shifts, isLoading, isError, error, refetch } = useShifts()
  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Keeps the name on screen while the delete dialog animates out.
  const [shownDelete, setShownDelete] = useState(null)
  if (deleteTarget && deleteTarget !== shownDelete) setShownDelete(deleteTarget)
  const deleteMutation = useDeleteShift()

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Shift
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{newButton()}</div>

      <Table
        caption="Shifts"
        columns={columns}
        rows={shifts ?? []}
        isLoading={isLoading}
        error={isError ? error?.message || 'Could not load shifts.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:clock"
        emptyMessage="No shifts yet — add your first shift"
        emptyAction={newButton('sm')}
        rowActions={(shift) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit shift" variant="ghost" size="sm" onClick={() => setFormTarget(shift)} />
            <IconButton icon="lucide:trash-2" label="Delete shift" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(shift)} />
          </>
        )}
      />

      {formTarget !== undefined && (
        <ShiftFormModal key={formTarget?.id ?? 'new'} shift={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete shift"
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      >
        <p>
          Delete <strong className="font-semibold text-fg">{shownDelete?.name}</strong>? Shifts still assigned to employees
          can&rsquo;t be deleted. This can&rsquo;t be undone.
        </p>
      </ConfirmDialog>
    </div>
  )
}
