import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Select from '@/components/ui/Select'

// 1 … 4 5 6 … 12
function pageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const items = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) items.push('gap-start')
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < totalPages - 1) items.push('gap-end')
  items.push(totalPages)
  return items
}

const pageButton =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-cell font-medium tabular-nums transition-colors duration-(--duration-fast) focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-40'

/**
 * Pager for an API list `meta` ({ page, limit, total, totalPages }). Shows a
 * "1–20 of 64" summary; page controls only when there is more than one page.
 * Pass `onPageSizeChange` to show a rows-per-page select.
 */
export default function Pagination({ meta, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50], className }) {
  if (!meta) return null
  const { page, totalPages, total, limit } = meta
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const sizeOptions = pageSizeOptions.map((n) => ({ value: n, label: String(n) }))

  return (
    <nav aria-label="Pagination" className={clsx('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-cell text-fg-muted tabular-nums" aria-live="polite">
        {total != null && limit ? (
          <>
            <span className="font-medium text-fg">
              {from}–{to}
            </span>{' '}
            of <span className="font-medium text-fg">{total}</span>
          </>
        ) : (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-cell text-fg-muted">
            Rows
            <div className="w-20">
              <Select
                aria-label="Rows per page"
                options={sizeOptions}
                value={sizeOptions.find((o) => o.value === limit) ?? null}
                onChange={(o) => onPageSizeChange(o.value)}
                isSearchable={false}
                menuPlacement="auto"
              />
            </div>
          </label>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={clsx(pageButton, 'text-fg-muted hover:bg-surface-hover hover:text-fg')}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            >
              <Icon icon="lucide:chevron-left" width="16" height="16" aria-hidden />
            </button>
            {pageItems(page, totalPages).map((item) =>
              typeof item === 'number' ? (
                <button
                  key={item}
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => item !== page && onPageChange(item)}
                  className={clsx(
                    pageButton,
                    item === page
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100'
                      : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                    // Keep only neighbours and ends on phones.
                    Math.abs(item - page) > 1 && item !== 1 && item !== totalPages && 'hidden sm:inline-flex',
                  )}
                >
                  {item}
                </button>
              ) : (
                <span key={item} aria-hidden className="px-1 text-cell text-fg-subtle">
                  …
                </span>
              ),
            )}
            <button
              type="button"
              className={clsx(pageButton, 'text-fg-muted hover:bg-surface-hover hover:text-fg')}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            >
              <Icon icon="lucide:chevron-right" width="16" height="16" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
