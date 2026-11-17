import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import FileActions from '@/components/ui/FileActions'
import { trainingDocumentDownloadUrl } from '@/services/trainingDocumentService'
import { useMyUploads } from '@/hooks/useMyUploads'
import { useMyAssignments } from '@/hooks/useMyAssignments'
import UploadDocumentModal from '@/pages/training/components/UploadDocumentModal'
import AssignDocumentModal from '@/pages/training/components/AssignDocumentModal'
import DeleteDocumentModal from '@/pages/training/components/DeleteDocumentModal'
import RemoveAssignmentModal from '@/pages/training/components/RemoveAssignmentModal'
import TrainingDocTitle from '@/pages/training/components/TrainingDocTitle'
import { fmtDate, renderTarget } from '@/pages/training/utils/trainingFormat'

const LIMIT = 10

const TABS = [
  { key: 'documents', label: 'My Documents' },
  { key: 'assignments', label: 'My Assignments' },
]

const documentColumns = [
  { key: 'title', header: 'Title', render: (d) => <TrainingDocTitle title={d.title} mimeType={d.mimeType} /> },
  { key: 'category', header: 'Category', render: (d) => d.category?.name ?? '—' },
  {
    key: 'description',
    header: 'Description',
    className: 'text-fg-muted',
    render: (d) =>
      d.description ? (
        <span title={d.description} className="block max-w-56 truncate">
          {d.description}
        </span>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
  },
  { key: 'uploaded', header: 'Uploaded', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (d) => fmtDate(d.uploadDate ?? d.createdAt) },
]

function MyDocumentsTab() {
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isFetching, isError, error, refetch } = useMyUploads(params)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setShowUpload(true)}>
          <Icon icon="lucide:upload" width="16" height="16" aria-hidden />
          Upload Document
        </Button>
      </div>

      <Table
        caption="My uploaded documents"
        columns={documentColumns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:file-text"
        emptyMessage="You haven't uploaded any documents yet"
        rowActions={(doc) => (
          <>
            <FileActions url={trainingDocumentDownloadUrl(doc.id)} mimeType={doc.mimeType} name={doc.title} />
            <IconButton icon="lucide:user-plus" label="Assign document" variant="ghost" size="sm" onClick={() => setAssignTarget(doc)} />
            <IconButton icon="lucide:trash-2" label="Delete document" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(doc)} />
          </>
        )}
      />

      {showUpload && <UploadDocumentModal onClose={() => setShowUpload(false)} />}
      {assignTarget && <AssignDocumentModal document={assignTarget} onClose={() => setAssignTarget(null)} />}
      {deleteTarget && <DeleteDocumentModal document={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}

const assignmentColumns = [
  { key: 'document', header: 'Document', className: 'font-medium', render: (a) => a.document?.title ?? '—' },
  { key: 'target', header: 'Target', render: renderTarget },
  { key: 'assigned', header: 'Assigned', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (a) => fmtDate(a.assignedDate ?? a.createdAt) },
]

function MyAssignmentsTab() {
  const [page, setPage] = useState(1)
  const [removeTarget, setRemoveTarget] = useState(null)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isFetching, isError, error, refetch } = useMyAssignments(params)

  return (
    <div className="space-y-4">
      <Table
        caption="My training assignments"
        columns={assignmentColumns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:user-check"
        emptyMessage="You haven't assigned any training yet"
        rowActions={(a) => (
          <IconButton icon="lucide:trash-2" label="Remove assignment" variant="ghost-danger" size="sm" onClick={() => setRemoveTarget(a)} />
        )}
      />

      <RemoveAssignmentModal assignment={removeTarget} onClose={() => setRemoveTarget(null)} />
    </div>
  )
}

export default function ManageTrainingPage() {
  const [activeKey, setActiveKey] = useState('documents')

  return (
    <div className="space-y-5">
      <Tabs id="manage-training" tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      <TabPanel id="manage-training" activeKey={activeKey}>
        {activeKey === 'documents' ? <MyDocumentsTab /> : <MyAssignmentsTab />}
      </TabPanel>
    </div>
  )
}
