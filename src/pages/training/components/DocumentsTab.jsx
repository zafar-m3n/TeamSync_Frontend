import { useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import FileActions from '@/components/ui/FileActions'
import FormField from '@/components/form/FormField'
import { trainingDocumentDownloadUrl } from '@/services/trainingDocumentService'
import { useTrainingCategories } from '@/hooks/useTrainingCategories'
import { useAllTrainingDocuments } from '@/hooks/useAllTrainingDocuments'
import { useListFilters } from '@/hooks/useListFilters'
import { fmtDate } from '@/pages/training/utils/trainingFormat'
import DeleteDocumentModal from '@/pages/training/components/DeleteDocumentModal'
import TrainingDocTitle from '@/pages/training/components/TrainingDocTitle'

const LIMIT = 10

const columns = [
  { key: 'title', header: 'Title', render: (d) => <TrainingDocTitle title={d.title} mimeType={d.mimeType} /> },
  { key: 'category', header: 'Category', render: (d) => d.category?.name ?? '—' },
  { key: 'uploadedBy', header: 'Uploaded By', render: (d) => d.uploadedByUser?.employee?.fullName ?? '—' },
  { key: 'uploaded', header: 'Uploaded', className: 'whitespace-nowrap tabular-nums text-fg-muted', render: (d) => fmtDate(d.uploadDate ?? d.createdAt) },
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
  const { data, isLoading, isFetching, isError, error, refetch } = useAllTrainingDocuments(params)

  return (
    <div className="space-y-4">
      <div className="w-full sm:w-64">
        <FormField label="Category">
          <Select
            isClearable
            options={categoryOptions}
            value={category}
            onChange={(opt) => setFilter('category', opt ?? null)}
            placeholder="Any category"
          />
        </FormField>
      </div>

      <Table
        caption="Training documents"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load documents.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:file-text"
        emptyMessage="No documents match this filter"
        rowActions={(doc) => (
          <>
            <FileActions url={trainingDocumentDownloadUrl(doc.id)} mimeType={doc.mimeType} name={doc.title} />
            <IconButton icon="lucide:trash-2" label="Delete document" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(doc)} />
          </>
        )}
      />

      {deleteTarget && <DeleteDocumentModal document={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}
