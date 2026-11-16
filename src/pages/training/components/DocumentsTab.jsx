import { useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import IconButton from '@/components/ui/IconButton'
import FileActions from '@/components/ui/FileActions'
import { trainingDocumentDownloadUrl } from '@/services/trainingDocumentService'
import { useTrainingCategories } from '@/hooks/useTrainingCategories'
import { useAllTrainingDocuments } from '@/hooks/useAllTrainingDocuments'
import { useListFilters } from '@/hooks/useListFilters'
import { fmtDate } from '@/pages/training/utils/trainingFormat'
import DeleteDocumentModal from '@/pages/training/components/DeleteDocumentModal'
import PageControls from '@/pages/training/components/PageControls'
import ListLoadError from '@/pages/training/components/ListLoadError'

const LIMIT = 10

const documentColumns = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'uploadedBy', header: 'Uploaded By' },
  { key: 'uploaded', header: 'Uploaded' },
  { key: 'actions', header: 'Actions' },
]

export default function DocumentsTab() {
  const { filters, page, setFilter, setPage } = useListFilters({ category: null })
  const { category } = filters
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { data: categories = [] } = useTrainingCategories()
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

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
          onChange={(opt) => setFilter('category', opt ?? null)}
          placeholder="Any category"
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={documentColumns} rows={LIMIT} />
      ) : isError ? (
        <ListLoadError
          message={error?.message || 'Could not load documents.'}
          onRetry={() => refetch()}
        />
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FileActions
                      url={trainingDocumentDownloadUrl(doc.id)}
                      mimeType={doc.mimeType}
                      name={doc.title}
                    />
                    <IconButton
                      icon="lucide:trash-2"
                      label="Delete document"
                      variant="ghost-danger"
                      size="sm"
                      onClick={() => setDeleteTarget(doc)}
                    />
                  </div>
                </td>
              </tr>
            )}
          />
          <PageControls page={page} meta={meta} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      {deleteTarget && (
        <DeleteDocumentModal document={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
