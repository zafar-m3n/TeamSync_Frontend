import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Input from '@/components/form/Input'
import { useDepartments, useDeleteDepartment } from '@/hooks/useDepartments'
import { useDebouncedFilter, useListFilters } from '@/hooks/useListFilters'
import DepartmentFormModal from '@/pages/departments-shifts/components/DepartmentFormModal'

const LIMIT = 10

const columns = [
  { key: 'name', header: 'Name', className: 'font-medium' },
  {
    key: 'head',
    header: 'Department Head',
    render: (d) => d.departmentHead?.fullName ?? <span className="text-fg-subtle">—</span>,
  },
]

export default function DepartmentsTab() {
  const [search, setSearch] = useState('')
  const { filters, page, setFilter, setPage } = useListFilters({ search: '' })
  const debouncedSearch = filters.search
  useDebouncedFilter(setFilter, 'search', search.trim())

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, debouncedSearch],
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useDepartments(params)
  const deleteMutation = useDeleteDepartment()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Keeps the name on screen while the delete dialog animates out.
  const [shownDelete, setShownDelete] = useState(null)
  if (deleteTarget && deleteTarget !== shownDelete) setShownDelete(deleteTarget)

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Department
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon="lucide:search"
            width="16"
            height="16"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <Input
            type="search"
            aria-label="Search departments"
            placeholder="Search departments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {newButton()}
      </div>

      <Table
        caption="Departments"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load departments.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:building-2"
        emptyMessage="No departments yet — add your first department"
        emptyAction={newButton('sm')}
        rowActions={(dept) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit department" variant="ghost" size="sm" onClick={() => setFormTarget(dept)} />
            <IconButton
              icon="lucide:trash-2"
              label="Delete department"
              variant="ghost-danger"
              size="sm"
              onClick={() => setDeleteTarget(dept)}
            />
          </>
        )}
      />

      {formTarget !== undefined && (
        <DepartmentFormModal key={formTarget?.id ?? 'new'} department={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete department"
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      >
        <p>
          Delete <strong className="font-semibold text-fg">{shownDelete?.name}</strong>? This can&rsquo;t be undone.
        </p>
      </ConfirmDialog>
    </div>
  )
}
