import Table from '../../components/ui/Table'
import TableSkeleton from '../../components/ui/TableSkeleton'
import Button from '../../components/ui/Button'
import { useAssignedTraining } from '../../hooks/useAssignedTraining'

const columns = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'description', header: 'Description' },
]

export default function MyTrainingPage() {
  const { data: rows = [], isLoading, isError, error, refetch } = useAssignedTraining()

  if (isLoading) return <TableSkeleton columns={columns} rows={5} />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
        <p className="text-sm text-gray-600">
          {error?.message || 'Could not load your training.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <Table
      columns={columns}
      rows={rows}
      emptyMessage="No training assigned yet."
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
        </tr>
      )}
    />
  )
}
