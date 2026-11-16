import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import IconButton from '@/components/ui/IconButton'
import { useAllTrainingAssignments } from '@/hooks/useAllTrainingAssignments'
import { useListFilters } from '@/hooks/useListFilters'
import { fmtDate, renderTarget } from '@/pages/training/utils/trainingFormat'
import AssignmentFilters from '@/pages/training/components/AssignmentFilters'
import RemoveAssignmentModal from '@/pages/training/components/RemoveAssignmentModal'
import PageControls from '@/pages/training/components/PageControls'
import ListLoadError from '@/pages/training/components/ListLoadError'

const LIMIT = 10

const assignmentColumns = [
  { key: 'document', header: 'Document' },
  { key: 'target', header: 'Target' },
  { key: 'assignedBy', header: 'Assigned By' },
  { key: 'assigned', header: 'Assigned' },
  { key: 'actions', header: 'Actions' },
]

export default function AssignmentsTab() {
  const { filters, page, setFilter, setPage } = useListFilters({
    document: null,
    employee: null,
    dept: null,
  })
  const [removeTarget, setRemoveTarget] = useState(null)

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(filters.document ? { documentId: filters.document.value } : {}),
      ...(filters.employee ? { employeeId: filters.employee.value } : {}),
      ...(filters.dept ? { departmentId: filters.dept.value } : {}),
    }),
    [page, filters],
  )
  const { data, isLoading, isError, error, refetch } = useAllTrainingAssignments(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <AssignmentFilters filters={filters} onChange={setFilter} />

      {isLoading ? (
        <TableSkeleton columns={assignmentColumns} rows={LIMIT} />
      ) : isError ? (
        <ListLoadError
          message={error?.message || 'Could not load assignments.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <Table
            columns={assignmentColumns}
            rows={rows}
            emptyMessage="No assignments match these filters"
            renderRow={(a) => (
              <tr
                key={a.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{a.document?.title ?? '—'}</td>
                <td className="px-4 py-3 text-text">{renderTarget(a)}</td>
                <td className="px-4 py-3 text-text">{a.assignedBy?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-text">
                  {fmtDate(a.assignedDate ?? a.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <IconButton
                    icon="lucide:trash-2"
                    label="Remove assignment"
                    variant="danger"
                    size="sm"
                    onClick={() => setRemoveTarget(a)}
                  />
                </td>
              </tr>
            )}
          />
          <PageControls page={page} meta={meta} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      <RemoveAssignmentModal assignment={removeTarget} onClose={() => setRemoveTarget(null)} />
    </div>
  )
}
