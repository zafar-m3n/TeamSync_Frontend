import { useState } from 'react'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import { toast } from '@/hooks/useToast'
import { useUploadDocument, useDeleteDocument } from '@/hooks/useEmployee'

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

const baseColumns = [
  { key: 'docName', header: 'Document' },
  { key: 'uploadDate', header: 'Uploaded' },
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
            variant="accent"
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
            placeholder="Offer Letter"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">File</span>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-colors hover:border-accent hover:bg-gray-100 focus-within:ring-2 focus-within:ring-accent">
            <Icon
              icon={file ? 'lucide:file-check-2' : 'lucide:upload-cloud'}
              width="24"
              height="24"
              className={file ? 'text-accent' : 'text-gray-400'}
              aria-hidden
            />
            <span className="text-sm text-text">
              {file ? file.name : 'Click to choose a file'}
            </span>
            <span className="text-xs text-gray-500">
              PDF, Word, or JPEG/PNG · up to 5 MB
            </span>
            <input
              type="file"
              accept="application/pdf,.doc,.docx,image/jpeg,image/png"
              className="sr-only"
              onChange={onFileChange}
            />
          </label>
        </div>
      </form>
    </Modal>
  )
}

export default function EmployeeDocumentsList({ employeeId, documents = [], canEdit }) {
  const del = useDeleteDocument()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const columns = canEdit
    ? [...baseColumns, { key: 'actions', header: '' }]
    : baseColumns

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
            Upload document
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        rows={documents}
        emptyMessage="No documents uploaded"
        renderRow={(doc) => (
          <tr key={doc.id} className="border-b border-gray-100 last:border-0">
            <td className="px-4 py-3 text-text">
              <span className="flex items-center gap-2">
                <Icon
                  icon="lucide:file-text"
                  width="16"
                  height="16"
                  className="shrink-0 text-gray-400"
                  aria-hidden
                />
                <span>{doc.docName}</span>
              </span>
            </td>
            <td className="px-4 py-3 text-text">{fmtDate(doc.uploadDate)}</td>
            {canEdit && (
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <IconButton
                    icon="lucide:trash-2"
                    label="Delete document"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(doc)}
                  />
                </div>
              </td>
            )}
          </tr>
        )}
      />

      {uploadOpen && (
        <UploadDocumentModal
          employeeId={employeeId}
          onClose={() => setUploadOpen(false)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete document"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={del.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={del.isPending}
              onClick={() =>
                del.mutate(
                  { id: employeeId, documentId: deleteTarget.id },
                  { onSuccess: () => setDeleteTarget(null) },
                )
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.docName}</strong>? This can’t be undone.
        </p>
      </Modal>
    </div>
  )
}
