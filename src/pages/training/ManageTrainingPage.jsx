import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import Tabs from '@/components/ui/Tabs'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Modal from '@/components/ui/Modal'
import { useMyUploads } from '@/hooks/useMyUploads'
import { useMyAssignments } from '@/hooks/useMyAssignments'
import { useRemoveAssignment } from '@/hooks/useTrainingMutations'
import UploadDocumentModal from '@/pages/training/components/UploadDocumentModal'
import AssignDocumentModal from '@/pages/training/components/AssignDocumentModal'

const LIMIT = 10

const TABS = [
  { key: 'documents', label: 'My Documents' },
  { key: 'assignments', label: 'My Assignments' },
]

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

// Shared with TrainingPage's Assignments tab — render whichever target fields
// are non-null (employee, department, or both).
function renderTarget(a) {
  const emp = a.employee?.fullName
  const dept = a.department?.name
  if (emp && dept) return `${emp} · ${dept}`
  return emp || dept || '—'
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

const documentColumns = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'description', header: 'Description' },
  { key: 'uploaded', header: 'Uploaded' },
  { key: 'actions', header: 'Actions' },
]

function MyDocumentsTab() {
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isError, error, refetch } = useMyUploads(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => setShowUpload(true)}>
          Upload Document
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={documentColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load your documents.'}
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
            emptyMessage="You haven't uploaded any documents yet"
            renderRow={(doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{doc.title}</td>
                <td className="px-4 py-3 text-text">{doc.category?.name ?? '—'}</td>
                <td
                  className="max-w-xs truncate px-4 py-3 text-text"
                  title={doc.description || undefined}
                >
                  {doc.description || '—'}
                </td>
                <td className="px-4 py-3 text-text">
                  {fmtDate(doc.uploadDate ?? doc.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <IconButton
                    icon="lucide:user-plus"
                    label="Assign document"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAssignTarget(doc)}
                  />
                </td>
              </tr>
            )}
          />
          <Pagination page={page} meta={meta} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      {showUpload && <UploadDocumentModal onClose={() => setShowUpload(false)} />}
      {assignTarget && (
        <AssignDocumentModal
          document={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  )
}

const assignmentColumns = [
  { key: 'document', header: 'Document' },
  { key: 'target', header: 'Target' },
  { key: 'assigned', header: 'Assigned' },
  { key: 'actions', header: 'Actions' },
]

function MyAssignmentsTab() {
  const [page, setPage] = useState(1)
  const [removeTarget, setRemoveTarget] = useState(null)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isError, error, refetch } = useMyAssignments(params)
  const removeMutation = useRemoveAssignment()

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      {isLoading ? (
        <TableSkeleton columns={assignmentColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load your assignments.'}
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
            emptyMessage="You haven't assigned any training yet"
            renderRow={(a) => (
              <tr
                key={a.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{a.document?.title ?? '—'}</td>
                <td className="px-4 py-3 text-text">{renderTarget(a)}</td>
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

export default function ManageTrainingPage() {
  const [activeKey, setActiveKey] = useState('documents')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'documents' ? <MyDocumentsTab /> : <MyAssignmentsTab />}
    </div>
  )
}
