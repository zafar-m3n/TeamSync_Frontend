import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import 'react-day-picker/style.css'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import { useTeamAttendance } from '@/hooks/useTeamAttendance'
import { useMyTeam } from '@/hooks/useMyTeam'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'
import OverrideAttendanceModal from '@/pages/attendance/components/OverrideAttendanceModal'

const columns = [
  { key: 'employee', header: 'Employee' },
  { key: 'status', header: 'Status' },
  { key: 'clockIn', header: 'Clock In' },
  { key: 'clockOut', header: 'Clock Out' },
  { key: 'actions', header: 'Actions' },
]

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function fmtTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'p')
}

function SingleDateField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = value ? new Date(`${value}T00:00:00`) : undefined

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-56 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className="text-text">
          {selected ? format(selected, 'PP') : 'Pick a date'}
        </span>
        <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
      </button>

      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={{
            '--rdp-accent-color': '#059c99',
            '--rdp-accent-background-color': '#e6f4f3',
          }}
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              if (d) {
                onChange(toYmd(d))
                setOpen(false)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function TeamAttendancePage() {
  const [date, setDate] = useState(() => toYmd(new Date()))
  const [correctTarget, setCorrectTarget] = useState(null)

  const { data: rows = [], isLoading, isError, error, refetch } = useTeamAttendance(date)
  const { data: team = [] } = useMyTeam()

  const emptyMessage =
    team.length === 0 ? 'No direct reports' : 'No attendance records for this date'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
          <SingleDateField value={date} onChange={setDate} />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load team attendance.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage={emptyMessage}
          renderRow={(rec) => (
            <tr
              key={rec.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">{rec.employee?.fullName ?? '—'}</td>
              <td className="px-4 py-3">
                <AttendanceStatusBadge
                  status={rec.status}
                  isManualOverride={rec.isManualOverride}
                />
              </td>
              <td className="px-4 py-3 text-text">{fmtTime(rec.clockIn)}</td>
              <td className="px-4 py-3 text-text">{fmtTime(rec.clockOut)}</td>
              <td className="px-4 py-3">
                {rec.status === 'Absent' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCorrectTarget(rec)}
                  >
                    Correct
                  </Button>
                ) : null}
              </td>
            </tr>
          )}
        />
      )}

      {correctTarget && (
        <OverrideAttendanceModal
          record={correctTarget}
          onClose={() => setCorrectTarget(null)}
        />
      )}
    </div>
  )
}
