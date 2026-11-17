import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import { SkeletonRows } from '@/components/ui/TableSkeleton'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

function SortIcon({ active, direction }) {
  const icon = !active ? 'lucide:chevrons-up-down' : direction === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'
  return (
    <Icon
      icon={icon}
      width="14"
      height="14"
      aria-hidden
      className={active ? 'text-brand-600' : 'text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'}
    />
  )
}

const compare = (a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Data table.
 *
 * columns: { key, header, sortable?, align?, className?, render?(row), sortValue?(row) }
 * Rows render from `columns` (or a custom `renderRow` returning a <tr>). `rowActions(row)`
 * adds a right-aligned actions cell.
 *
 * Sorting: pass `sortState` + `onSort` to control it (e.g. server-side); otherwise
 * sortable columns sort the given rows in the browser — only use that for lists that
 * aren't paginated, since it can only see the current page.
 *
 * States: `isLoading` shows skeleton rows, `error` shows ErrorState (with `onRetry`),
 * empty shows EmptyState (`emptyMessage`, `emptyAction`, or a custom `empty` node).
 * Pagination: pass the API `meta` and `onPageChange` (and optionally `onPageSizeChange`).
 */
export default function Table({
  columns,
  rows = [],
  renderRow,
  rowActions,
  getRowKey = (row, i) => row.id ?? i,
  onSort,
  sortState,
  isLoading = false,
  isFetching = false,
  error,
  onRetry,
  emptyMessage = 'Nothing here yet.',
  emptyTitle,
  emptyIcon,
  emptyAction,
  empty,
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  caption,
  loadingRows = 5,
  className,
}) {
  const [localSort, setLocalSort] = useState(null)
  const controlled = typeof onSort === 'function'
  const sort = controlled ? sortState : localSort

  const sortedRows = useMemo(() => {
    if (controlled || !localSort) return rows
    const col = columns.find((c) => c.key === localSort.key)
    if (!col) return rows
    const value = col.sortValue ?? ((row) => row[col.key])
    const dir = localSort.direction === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => dir * compare(value(a), value(b)))
  }, [rows, columns, localSort, controlled])

  const toggleSort = (key) => {
    if (controlled) return onSort(key)
    setLocalSort((s) =>
      s?.key !== key ? { key, direction: 'asc' } : s.direction === 'asc' ? { key, direction: 'desc' } : null,
    )
  }

  const allColumns = rowActions
    ? [...columns, { key: '__actions', header: <span className="sr-only">Actions</span>, align: 'right' }]
    : columns
  const colSpan = allColumns.length
  const showPager = meta && onPageChange && !isLoading && !error && sortedRows.length > 0

  const body = () => {
    if (isLoading) return <SkeletonRows columns={colSpan} rows={loadingRows} />
    if (error)
      return (
        <tr>
          <td colSpan={colSpan}>
            <ErrorState compact message={typeof error === 'string' ? error : undefined} onRetry={onRetry} />
          </td>
        </tr>
      )
    if (sortedRows.length === 0)
      return (
        <tr>
          <td colSpan={colSpan}>
            {empty ?? <EmptyState compact icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />}
          </td>
        </tr>
      )
    return sortedRows.map((row, index) =>
      renderRow ? (
        renderRow(row, index)
      ) : (
        <tr key={getRowKey(row, index)} className="border-b border-line transition-colors duration-(--duration-fast) last:border-0 hover:bg-surface-subtle">
          {columns.map((col) => (
            <td key={col.key} className={clsx('px-4 py-3 text-fg', ALIGN[col.align], col.className)}>
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
          {rowActions && (
            <td className="px-4 py-2 text-right">
              <div className="flex items-center justify-end gap-1.5">{rowActions(row)}</div>
            </td>
          )}
        </tr>
      ),
    )
  }

  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
        <table className="w-full border-collapse text-left text-cell" aria-busy={isLoading || isFetching || undefined}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-surface-subtle">
              {allColumns.map((col) => {
                const active = sort?.key === col.key
                const ariaSort = col.sortable ? (active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={clsx(
                      'whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-fg-muted',
                      ALIGN[col.align],
                      col.headerClassName,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={clsx(
                          'group -mx-1 inline-flex items-center gap-1 rounded px-1 uppercase tracking-wide transition-colors hover:text-fg focus-visible:focus-ring',
                          active && 'text-fg',
                        )}
                      >
                        <span>{col.header}</span>
                        <SortIcon active={active} direction={sort?.direction} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className={clsx('transition-opacity duration-(--duration-base)', isFetching && !isLoading && 'opacity-60')}>
            {body()}
          </tbody>
        </table>
      </div>
      {showPager && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  )
}
