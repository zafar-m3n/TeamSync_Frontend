import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import { useAllTrainingAssignments } from '@/hooks/useAllTrainingAssignments'
import { useListFilters } from '@/hooks/useListFilters'
import { fmtDate, renderTarget } from '@/pages/training/utils/trainingFormat'
import AssignmentFilters from '@/pages/training/components/AssignmentFilters'
import RemoveAssignmentModal from '@/pages/training/components/RemoveAssignmentModal'

const LIMIT = 10

const columns = [
  { key: 'document', header: 'Document', className: 'font-medium', render: (a) => a.document?.title ?? '—' },
  { key: 'target', header: 'Target', render: renderTarget },
  { key: 'assignedBy', header: 'Assigned By', render: (a) => a.assignedByUser?.employee?.fullName ?? '—' },
  { key: 'assigned', header: 'Assigned', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (a) => fmtDate(a.assignedDate ?? a.createdAt) },
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
  const { data, isLoading, isFetching, isError, error, refetch } = useAllTrainingAssignments(params)

  return (
    <div className="space-y-5">
      <AssignmentFilters filters={filters} onChange={setFilter} />

      <Table
        caption="Training assignments"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:user-check"
        emptyMessage="No assignments match these filters"
        rowActions={(a) => (
          <IconButton icon="lucide:trash-2" label="Remove assignment" variant="ghost-danger" size="sm" onClick={() => setRemoveTarget(a)} />
        )}
      />

      <RemoveAssignmentModal assignment={removeTarget} onClose={() => setRemoveTarget(null)} />
    </div>
  )
}
