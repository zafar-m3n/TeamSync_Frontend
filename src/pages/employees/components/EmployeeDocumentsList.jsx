import { useState } from 'react'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import FileDrop from '@/components/form/FileDrop'
import FileActions from '@/components/ui/FileActions'
import { toast } from '@/hooks/useToast'
import { useUploadDocument, useDeleteDocument } from '@/hooks/useEmployee'
import { documentDownloadUrl } from '@/services/employeeService'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]
const MAX_BYTES = 5 * 1024 * 1024

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'That file type isn’t supported. Upload a PDF, Word document, or a JPEG/PNG image.'
  }
  if (file.size > MAX_BYTES) {
    return 'That file is over 5 MB. Please choose a smaller file.'
  }
  return null
}

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

const columns = [
  {
    key: 'docName',
    header: 'Document',
    render: (doc) => (
      <span className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-fg-muted ring-1 ring-line">
          <Icon icon="lucide:file-text" width="16" height="16" aria-hidden />
        </span>
        <span className="font-medium text-fg">{doc.docName}</span>
      </span>
    ),
  },
  { key: 'uploadDate', header: 'Uploaded', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (doc) => fmtDate(doc.uploadDate) },
]

function UploadDocumentModal({ employeeId, onClose }) {
  const upload = useUploadDocument()
  const [docName, setDocName] = useState('')
  const [file, setFile] = useState(null)

  const onFileChange = (e) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const problem = validateFile(picked)
    if (problem) {
      toast.error(problem)
      setFile(null)
      return
    }
    setFile(picked)
  }

  const canSubmit = docName.trim() !== '' && file != null && !upload.isPending

  const onSubmit = (e) => {
    e.preventDefault()
    if (!file) return
    const problem = validateFile(file)
    if (problem) {
      toast.error(problem)
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docName', docName.trim())
    upload.mutate({ id: employeeId, formData }, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Upload document"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={upload.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-document-form"
            variant="primary"
            isLoading={upload.isPending}
            disabled={!canSubmit}
          >
            Upload
          </Button>
        </>
      }
    >
      <form
        id="upload-document-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Document Name" required>
          <Input
            autoFocus
            placeholder="Enter document name, e.g. Offer letter"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
        </FormField>

        <FormField label="File">
          <FileDrop
            file={file}
            accept="application/pdf,.doc,.docx,image/jpeg,image/png"
            hint="PDF, Word, or JPEG/PNG · up to 5 MB"
            onChange={onFileChange}
          />
        </FormField>
      </form>
    </Modal>
  )
}

export default function EmployeeDocumentsList({ employeeId, documents = [], canEdit }) {
  const del = useDeleteDocument()
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Keeps the name on screen while the dialog animates out.
  const [shownTarget, setShownTarget] = useState(null)
  if (deleteTarget && deleteTarget !== shownTarget) setShownTarget(deleteTarget)
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
            <Icon icon="lucide:upload" width="14" height="14" aria-hidden />
            Upload document
          </Button>
        </div>
      )}

      <Table
        caption="Documents"
        columns={columns}
        rows={documents}
        emptyMessage="No documents uploaded"
        emptyIcon="lucide:folder-open"
        rowActions={(doc) => (
          <>
            <FileActions url={documentDownloadUrl(employeeId, doc.id)} mimeType={doc.mimeType} name={doc.docName} />
            {canEdit && (
              <IconButton
                icon="lucide:trash-2"
                label="Delete document"
                variant="ghost-danger"
                size="sm"
                onClick={() => setDeleteTarget(doc)}
              />
            )}
          </>
        )}
      />

      {uploadOpen && <UploadDocumentModal employeeId={employeeId} onClose={() => setUploadOpen(false)} />}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete document"
        confirmLabel="Delete"
        tone="danger"
        isLoading={del.isPending}
        onConfirm={() =>
          del.mutate({ id: employeeId, documentId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) })
        }
      >
        <p>
          Delete <strong className="font-semibold text-fg">{shownTarget?.docName}</strong>? This can’t be undone.
        </p>
      </ConfirmDialog>
    </div>
  )
}
