import Skeleton from '@/components/ui/Skeleton'

const WIDTHS = ['w-32', 'w-24', 'w-40', 'w-20', 'w-28']

export function SkeletonRows({ columns, rows = 5 }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r} className="border-b border-line last:border-0">
      {Array.from({ length: columns }, (_, c) => (
        <td key={c} className="px-4 py-3.5">
          <Skeleton className={`h-3 max-w-full ${WIDTHS[(r + c) % WIDTHS.length]}`} />
        </td>
      ))}
    </tr>
  ))
}

// Stand-alone loading table, for pages that render their own <table>.
export default function TableSkeleton({ columns = 4, rows = 5 }) {
  const columnCount = Array.isArray(columns) ? columns.length : columns

  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-subtle">
            {Array.from({ length: columnCount }, (_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-2.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SkeletonRows columns={columnCount} rows={rows} />
        </tbody>
      </table>
    </div>
  )
}
