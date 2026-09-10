import { useState } from 'react'
import { format } from 'date-fns'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { DateField } from '@/components/form/DatePicker'
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
          <DateField
            value={date}
            onChange={setDate}
            placeholder="Pick a date"
            className="w-56"
          />
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
                  <IconButton
                    icon="lucide:pencil"
                    label="Correct attendance"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCorrectTarget(rec)}
                  />
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
