import Table from '@/components/ui/Table'
import FileActions from '@/components/ui/FileActions'
import { trainingDocumentDownloadUrl } from '@/services/trainingDocumentService'
import { useAssignedTraining } from '@/hooks/useAssignedTraining'
import TrainingDocTitle from '@/pages/training/components/TrainingDocTitle'

const columns = [
  { key: 'title', header: 'Title', render: (d) => <TrainingDocTitle title={d.title} mimeType={d.mimeType} /> },
  { key: 'category', header: 'Category', render: (d) => d.category?.name ?? '—' },
  {
    key: 'description',
    header: 'Description',
    className: 'text-fg-muted',
    render: (d) =>
      d.description ? (
        <span title={d.description} className="block max-w-xs truncate">
          {d.description}
        </span>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
  },
]

export default function MyTrainingPage() {
  const { data: rows = [], isLoading, isError, error, refetch } = useAssignedTraining()

  return (
    <Table
      caption="My training"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      error={isError ? error?.message || 'Could not load your training.' : null}
      onRetry={() => refetch()}
      emptyIcon="lucide:graduation-cap"
      emptyMessage="No training assigned yet."
      rowActions={(doc) => <FileActions url={trainingDocumentDownloadUrl(doc.id)} mimeType={doc.mimeType} name={doc.title} />}
    />
  )
}
