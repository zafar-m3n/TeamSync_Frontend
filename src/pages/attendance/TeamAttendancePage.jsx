import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import FormField from '@/components/form/FormField'
import { DateField, toYmd } from '@/components/form/DatePicker'
import { useTeamAttendance } from '@/hooks/useTeamAttendance'
import { useMyTeam } from '@/hooks/useMyTeam'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'
import OverrideAttendanceModal from '@/pages/attendance/components/OverrideAttendanceModal'
import { fmtTime } from '@/pages/attendance/utils/attendanceFormat'

const LIMIT = 20

const columns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  { key: 'status', header: 'Status', render: (r) => <AttendanceStatusBadge status={r.status} isManualOverride={r.isManualOverride} /> },
  { key: 'clockIn', header: 'Clock In', className: 'tabular-nums', render: (r) => fmtTime(r.clockIn) },
  { key: 'clockOut', header: 'Clock Out', className: 'tabular-nums', render: (r) => fmtTime(r.clockOut) },
]

export default function TeamAttendancePage() {
  const [date, setDate] = useState(() => toYmd(new Date()))
  const [page, setPage] = useState(1)
  const [correctTarget, setCorrectTarget] = useState(null)

  const params = useMemo(() => ({ date, page, limit: LIMIT }), [date, page])
  const { data, isLoading, isFetching, isError, error, refetch } = useTeamAttendance(params)
  const { data: team = [] } = useMyTeam()

  const emptyMessage = team.length === 0 ? 'No direct reports' : 'No attendance records for this date'

  return (
    <div className="space-y-5">
      <div className="w-full sm:w-56">
        <FormField label="Date">
          <DateField
            value={date}
            onChange={(value) => {
              setDate(value)
              setPage(1)
            }}
            placeholder="Pick a date"
          />
        </FormField>
      </div>

      <Table
        caption="Team attendance"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError ? error?.message || 'Could not load team attendance.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:calendar-x"
        emptyMessage={emptyMessage}
        rowActions={(rec) =>
          rec.status === 'Absent' && (
            <IconButton icon="lucide:pencil" label="Correct attendance" variant="ghost" size="sm" onClick={() => setCorrectTarget(rec)} />
          )
        }
      />

      {correctTarget && <OverrideAttendanceModal record={correctTarget} onClose={() => setCorrectTarget(null)} />}
    </div>
  )
}
