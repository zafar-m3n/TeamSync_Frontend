import { useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Modal from '@/components/ui/Modal'
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
  { key: 'date', header: 'Date' },
  { key: 'name', header: 'Name' },
  { key: 'actions', header: 'Actions' },
]

export default function HolidaysPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data: holidays = [], isLoading, isError, error, refetch } = useHolidays(year)
  const deleteMutation = useDeleteHoliday()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => setFormTarget(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Year</label>
          <div className="w-40">
            <Select
              options={YEAR_OPTIONS}
              value={YEAR_OPTIONS.find((o) => o.value === year) ?? null}
              onChange={(opt) => setYear(opt.value)}
            />
          </div>
        </div>
        <Button variant="accent" className="ml-auto" onClick={openCreate}>
          New Holiday
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">{error?.message || 'Could not load holidays.'}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={holidays}
          emptyMessage={`No holidays for ${year} yet`}
          emptyAction={
            <Button variant="accent" size="sm" onClick={openCreate}>
              New Holiday
            </Button>
          }
          renderRow={(h) => (
            <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-text">{formatHolidayDate(h.date)}</td>
              <td className="px-4 py-3 text-text">{h.name}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <IconButton
                    icon="lucide:pencil"
                    label="Edit holiday"
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormTarget(h)}
                  />
                  <IconButton
                    icon="lucide:trash-2"
                    label="Delete holiday"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(h)}
                  />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {formTarget !== undefined && (
        <HolidayFormModal
          key={formTarget?.id ?? 'new'}
          holiday={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete holiday"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.name}</strong> ({formatHolidayDate(deleteTarget?.date)})?
          This can&rsquo;t be undone.
        </p>
      </Modal>
    </div>
  )
}
