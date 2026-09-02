import { useRef, useState } from 'react'
import { format } from 'date-fns'
import Table from '../../../components/ui/Table'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { toast } from '../../../hooks/useToast'
import { useUploadDocument, useDeleteDocument } from '../../../hooks/useEmployee'

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

export default function EmployeeDocumentsList({ employeeId, documents = [], canEdit }) {
  const fileInputRef = useRef(null)
  const upload = useUploadDocument()
  const del = useDeleteDocument()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const columns = canEdit
    ? [...baseColumns, { key: 'actions', header: '' }]
    : baseColumns

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateFile(file)
    if (problem) {
      toast.error(problem)
      return
    }
    const formData = new FormData()
    formData.append('document', file)
    upload.mutate({ id: employeeId, formData })
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.doc,.docx,image/jpeg,image/png"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            isLoading={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
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
            <td className="px-4 py-3 text-text">{doc.docName}</td>
            <td className="px-4 py-3 text-text">{fmtDate(doc.uploadDate)}</td>
            {canEdit && (
              <td className="px-4 py-3 text-right">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(doc)}
                >
                  Delete
                </Button>
              </td>
            )}
          </tr>
        )}
      />

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
