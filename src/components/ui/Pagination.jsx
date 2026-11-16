import Button from '@/components/ui/Button'

// Previous / Next controls for a list's `meta` ({ page, totalPages }); hidden for one page.
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null
  const { page, totalPages } = meta
  return (
    <div className="flex items-center justify-between">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
