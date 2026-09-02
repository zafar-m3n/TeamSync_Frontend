import { useEffect, useMemo, useState } from 'react'
import Table from '../../../components/ui/Table'
import TableSkeleton from '../../../components/ui/TableSkeleton'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/form/Input'
import { useDepartments, useDeleteDepartment } from '../../../hooks/useDepartments'
import DepartmentFormModal from './DepartmentFormModal'

const LIMIT = 10

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'head', header: 'Department Head' },
  { key: 'actions', header: 'Actions' },
]

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function DepartmentsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, debouncedSearch],
  )

  const { data, isLoading, isError, error, refetch } = useDepartments(params)
  const deleteMutation = useDeleteDepartment()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const openCreate = () => setFormTarget(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          type="search"
          placeholder="Search departments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="accent" onClick={openCreate}>
          New Department
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load departments.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage="No departments yet — add your first department"
            emptyAction={
              <Button variant="accent" size="sm" onClick={openCreate}>
                New Department
              </Button>
            }
            renderRow={(dept) => (
              <tr
                key={dept.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{dept.name}</td>
                <td className="px-4 py-3 text-gray-400">—</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setFormTarget(dept)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(dept)}
                    >
                      Delete
                    </Button>
                  </div>
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
        </>
      )}

      {formTarget !== undefined && (
        <DepartmentFormModal
          key={formTarget?.id ?? 'new'}
          department={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete department"
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
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.name}</strong>? This can&rsquo;t be undone.
        </p>
      </Modal>
    </div>
  )
}
