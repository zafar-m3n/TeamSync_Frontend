import { useMemo } from 'react'
import Table from '@/components/ui/Table'
import FormField from '@/components/form/FormField'
import { DateRangeField, toYmd } from '@/components/form/DatePicker'
import { useMyAttendance } from '@/hooks/useMyAttendance'
import { useListFilters } from '@/hooks/useListFilters'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'
import ClockPanel from '@/pages/attendance/components/ClockPanel'
import { fmtDate, fmtTime } from '@/pages/attendance/utils/attendanceFormat'
import { useAuth } from '@/store/useAuth'

const LIMIT = 10

const columns = [
  { key: 'date', header: 'Date', className: 'whitespace-nowrap font-medium tabular-nums', render: (r) => fmtDate(r.date) },
  { key: 'status', header: 'Status', render: (r) => <AttendanceStatusBadge status={r.status} isManualOverride={r.isManualOverride} /> },
  { key: 'clockIn', header: 'Clock In', className: 'tabular-nums', render: (r) => fmtTime(r.clockIn) },
  { key: 'clockOut', header: 'Clock Out', className: 'tabular-nums', render: (r) => fmtTime(r.clockOut) },
]

export default function MyAttendancePage() {
  const { can } = useAuth()
  const { filters, page, setFilter, setPage } = useListFilters({ range: undefined })
  const { range } = filters

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(range?.from ? { startDate: toYmd(range.from) } : {}),
      ...(range?.to ? { endDate: toYmd(range.to) } : {}),
    }),
    [page, range],
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useMyAttendance(params)

  return (
    <div className="space-y-6">
      {can('attendance', 'clock') && <ClockPanel prominent />}

      <section className="space-y-4">
        <div className="w-full sm:w-72">
          <FormField label="Date range">
            <DateRangeField value={range} onChange={(next) => setFilter('range', next)} placeholder="Any dates" />
          </FormField>
        </div>

        <Table
          caption="My attendance records"
          columns={columns}
          rows={data?.rows ?? []}
          meta={data?.meta}
          onPageChange={setPage}
          isLoading={isLoading}
          isFetching={isFetching}
          loadingRows={LIMIT}
          error={isError ? error?.message || 'Could not load your attendance.' : null}
          onRetry={() => refetch()}
          emptyIcon="lucide:calendar-x"
          emptyMessage="No attendance records yet"
        />
      </section>
    </div>
  )
}
