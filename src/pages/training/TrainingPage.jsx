import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useEmployees } from '@/hooks/useEmployees'
import { useDepartments } from '@/hooks/useDepartments'
import { useTrainingCategories } from '@/hooks/useTrainingCategories'
import { useAllTrainingDocuments } from '@/hooks/useAllTrainingDocuments'
import { useAllTrainingAssignments } from '@/hooks/useAllTrainingAssignments'
import { useRemoveAssignment } from '@/hooks/useTrainingMutations'
import TrainingCategoriesTab from '@/pages/training/components/TrainingCategoriesTab'

const LIMIT = 10

const TABS = [
  { key: 'documents', label: 'Documents' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'categories', label: 'Categories' },
]

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function renderTarget(a) {
  const emp = a.employee?.fullName
  const dept = a.department?.name
  if (emp && dept) return `${emp} · ${dept}`
  return emp || dept || '—'
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function Pagination({ page, meta, totalPages, onPage }) {
  if (!meta || totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
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
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

// No Actions column — HR/Admin cannot edit, delete or download a document.
const documentColumns = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'uploadedBy', header: 'Uploaded By' },
  { key: 'uploaded', header: 'Uploaded' },
]

function DocumentsTab() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState(null)
  const { data: categories = [] } = useTrainingCategories()
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  useEffect(() => {
    setPage(1)
  }, [category])

  const params = useMemo(
    () => ({ page, limit: LIMIT, ...(category ? { categoryId: category.value } : {}) }),
    [page, category],
  )
  const { data, isLoading, isError, error, refetch } = useAllTrainingDocuments(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="w-64">
        <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
        <Select
          isClearable
          options={categoryOptions}
          value={category}
          onChange={(opt) => setCategory(opt ?? null)}
          placeholder="Any category"
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={documentColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load documents.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={documentColumns}
            rows={rows}
            emptyMessage="No documents match this filter"
            renderRow={(doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{doc.title}</td>
                <td className="px-4 py-3 text-text">{doc.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text">
                  {doc.uploadedBy?.fullName ?? '—'}
                </td>
                <td className="px-4 py-3 text-text">
                  {fmtDate(doc.uploadDate ?? doc.createdAt)}
                </td>
              </tr>
            )}
          />
          <Pagination page={page} meta={meta} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}

const assignmentColumns = [
  { key: 'document', header: 'Document' },
  { key: 'target', header: 'Target' },
  { key: 'assignedBy', header: 'Assigned By' },
  { key: 'assigned', header: 'Assigned' },
  { key: 'actions', header: 'Actions' },
]

function AssignmentsTab() {
  const [page, setPage] = useState(1)
  const [document_, setDocument] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [dept, setDept] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)

  const { data: docData } = useAllTrainingDocuments({ page: 1, limit: 200 })
  const documentOptions = (docData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.title,
  }))

  const [employeeQuery, setEmployeeQuery] = useState('')
  const debouncedEmployeeQuery = useDebouncedValue(employeeQuery.trim(), 300)
  const { data: empData } = useEmployees({
    page: 1,
    limit: 20,
    ...(debouncedEmployeeQuery ? { search: debouncedEmployeeQuery } : {}),
  })
  const employeeOptions = (empData?.rows ?? []).map((e) => ({
    value: e.id,
    label: e.fullName,
  }))

  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departmentOptions = (deptData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const removeMutation = useRemoveAssignment()

  useEffect(() => {
    setPage(1)
  }, [document_, employee, dept])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(document_ ? { documentId: document_.value } : {}),
      ...(employee ? { employeeId: employee.value } : {}),
      ...(dept ? { departmentId: dept.value } : {}),
    }),
    [page, document_, employee, dept],
  )
  const { data, isLoading, isError, error, refetch } = useAllTrainingAssignments(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Document</label>
          <Select
            isClearable
            options={documentOptions}
            value={document_}
            onChange={(opt) => setDocument(opt ?? null)}
            placeholder="Any document"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Employee</label>
          <Select
            isClearable
            options={employeeOptions}
            filterOption={() => true}
            onInputChange={(v) => setEmployeeQuery(v)}
            value={employee}
            onChange={(opt) => setEmployee(opt ?? null)}
            placeholder="Any employee"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
          <Select
            isClearable
            options={departmentOptions}
            value={dept}
            onChange={(opt) => setDept(opt ?? null)}
            placeholder="Any department"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={assignmentColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load assignments.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRemoveTarget(a)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            )}
          />
          <Pagination page={page} meta={meta} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      <Modal
        isOpen={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Remove assignment"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRemoveTarget(null)}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={removeMutation.isPending}
              onClick={() =>
                removeMutation.mutate(removeTarget.id, {
                  onSuccess: () => setRemoveTarget(null),
                })
              }
            >
              Remove
            </Button>
          </>
        }
      >
        <p>Remove this training assignment? The document itself isn&rsquo;t deleted.</p>
      </Modal>
    </div>
  )
}

export default function TrainingPage() {
  const [activeKey, setActiveKey] = useState('documents')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'documents' && <DocumentsTab />}
      {activeKey === 'assignments' && <AssignmentsTab />}
      {activeKey === 'categories' && <TrainingCategoriesTab />}
    </div>
  )
}
