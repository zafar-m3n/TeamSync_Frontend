import clsx from 'clsx'
import { Icon } from '@iconify/react'

function SortIcon({ active, direction }) {
  let icon = 'lucide:chevrons-up-down'
  if (active && direction === 'asc') icon = 'lucide:chevron-up'
  else if (active && direction === 'desc') icon = 'lucide:chevron-down'
  return (
    <Icon
      icon={icon}
      width="14"
      height="14"
      className={active ? 'text-primary' : 'text-gray-400'}
    />
  )
}

export default function Table({
  columns,
  rows = [],
  renderRow,
  onSort,
  sortState,
  emptyMessage = 'Nothing here yet.',
  emptyAction,
}) {
  const isEmpty = rows.length === 0

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => {
              const active = sortState?.key === col.key
              return (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 font-medium text-text"
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(col.key)}
                      className="inline-flex items-center gap-1 rounded font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>{col.header}</span>
                      <SortIcon active={active} direction={sortState?.direction} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">{emptyMessage}</p>
                {emptyAction && (
                  <div className="mt-4 flex justify-center">{emptyAction}</div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, index) =>
              renderRow ? (
                renderRow(row, index)
              ) : (
                <tr
                  key={row.id ?? index}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ),
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
