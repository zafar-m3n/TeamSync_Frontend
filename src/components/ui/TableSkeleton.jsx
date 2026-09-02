export default function TableSkeleton({ columns = 4, rows = 5 }) {
  const columnCount = Array.isArray(columns) ? columns.length : columns

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-gray-100 last:border-0">
              {Array.from({ length: columnCount }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className="h-3 w-full max-w-[12rem] animate-pulse rounded bg-gray-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
