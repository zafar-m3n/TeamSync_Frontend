import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import 'react-day-picker/style.css'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import { useMyAttendance } from '@/hooks/useMyAttendance'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'

const LIMIT = 10

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'status', header: 'Status' },
  { key: 'clockIn', header: 'Clock In' },
  { key: 'clockOut', header: 'Clock Out' },
]

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function fmtTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'p')
}

function DateRangeField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'PP')} – ${format(value.to, 'PP')}`
      : `${format(value.from, 'PP')} – …`
    : 'Any dates'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-72 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={value?.from ? 'text-text' : 'text-gray-400'}>{label}</span>
        <span className="flex items-center gap-2">
          {value?.from && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onChange(undefined)
                }
              }}
              className="text-xs text-gray-400 hover:text-text"
            >
              Clear
            </span>
          )}
          <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={{
            '--rdp-accent-color': '#059c99',
            '--rdp-accent-background-color': '#e6f4f3',
          }}
        >
          <DayPicker mode="range" selected={value} onSelect={onChange} />
        </div>
      )}
    </div>
  )
}

export default function MyAttendancePage() {
  const [range, setRange] = useState(undefined)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [range])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(range?.from ? { startDate: toYmd(range.from) } : {}),
      ...(range?.to ? { endDate: toYmd(range.to) } : {}),
    }),
    [page, range],
  )

  const { data, isLoading, isError, error, refetch } = useMyAttendance(params)
  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date range</label>
          <DateRangeField value={range} onChange={setRange} />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load your attendance.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage="No attendance records yet"
            renderRow={(rec) => (
              <tr
                key={rec.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{fmtDate(rec.date)}</td>
                <td className="px-4 py-3">
                  <AttendanceStatusBadge
                    status={rec.status}
                    isManualOverride={rec.isManualOverride}
                  />
                </td>
                <td className="px-4 py-3 text-text">{fmtTime(rec.clockIn)}</td>
                <td className="px-4 py-3 text-text">{fmtTime(rec.clockOut)}</td>
              </tr>
            )}
          />

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {meta.page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
