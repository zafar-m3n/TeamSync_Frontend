import { useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FormField from '@/components/form/FormField'
import { Icon } from '@iconify/react'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useHolidays, useDeleteHoliday } from '@/hooks/useHolidays'
import HolidayFormModal from '@/pages/holidays/components/HolidayFormModal'
import { formatHolidayDate } from '@/pages/holidays/utils/formatHolidayDate'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => ({
  value: y,
  label: String(y),
}))

const columns = [
  { key: 'date', header: 'Date', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (h) => formatHolidayDate(h.date) },
  { key: 'name', header: 'Name', className: 'font-medium' },
]

export default function HolidaysPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data: holidays = [], isLoading, isError, error, refetch } = useHolidays(year)
  const deleteMutation = useDeleteHoliday()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Keeps the name on screen while the delete dialog animates out.
  const [shownDelete, setShownDelete] = useState(null)
  if (deleteTarget && deleteTarget !== shownDelete) setShownDelete(deleteTarget)

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Holiday
    </Button>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <FormField label="Year">
            <Select
              options={YEAR_OPTIONS}
              value={YEAR_OPTIONS.find((o) => o.value === year) ?? null}
              onChange={(opt) => setYear(opt.value)}
            />
          </FormField>
        </div>
        <div className="ml-auto">{newButton()}</div>
      </div>

      <Table
        caption={`Holidays in ${year}`}
        columns={columns}
        rows={holidays}
        isLoading={isLoading}
        error={isError ? error?.message || 'Could not load holidays.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:calendar"
        emptyMessage={`No holidays for ${year} yet`}
        emptyAction={newButton('sm')}
        rowActions={(h) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit holiday" variant="ghost" size="sm" onClick={() => setFormTarget(h)} />
            <IconButton icon="lucide:trash-2" label="Delete holiday" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(h)} />
          </>
        )}
      />

      {formTarget !== undefined && (
        <HolidayFormModal key={formTarget?.id ?? 'new'} holiday={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete holiday"
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      >
        <p>
          Delete <strong className="font-semibold text-fg">{shownDelete?.name}</strong> ({formatHolidayDate(shownDelete?.date)})? This
          can&rsquo;t be undone.
        </p>
      </ConfirmDialog>
    </div>
  )
}
