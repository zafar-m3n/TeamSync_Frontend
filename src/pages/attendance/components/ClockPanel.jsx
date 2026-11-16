import { format } from 'date-fns'
import Button from '@/components/ui/Button'
import { parseYmd } from '@/components/form/DatePicker'
import { useClockIn, useClockOut, useClockStatus } from '@/hooks/useClock'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'

const time = (value) => (value ? format(new Date(value), 'p') : null)
const hhmm = (t) => t?.slice(0, 5)

// Clock in / clock out for the signed-in employee's current shift.
export default function ClockPanel() {
  const { data: status, isLoading, isError, error } = useClockStatus()
  const clockIn = useClockIn()
  const clockOut = useClockOut()
  const busy = clockIn.isPending || clockOut.isPending

  let body
  if (isLoading) {
    body = <p className="text-sm text-gray-500">Loading today&rsquo;s shift…</p>
  } else if (isError) {
    body = (
      <p className="text-sm text-gray-500">
        {error?.code === 'NO_SHIFT_ASSIGNED'
          ? 'You have no shift assigned yet, so clocking in is unavailable.'
          : error?.message || 'Could not load your shift.'}
      </p>
    )
  } else {
    const { shift, shiftDay, record, canClockIn, canClockOut } = status
    const inAt = time(record?.clockIn)
    const outAt = time(record?.clockOut)
    body = (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            {shift.name} · {hhmm(shift.startTime)}–{hhmm(shift.endTime)} ·{' '}
            {format(parseYmd(shiftDay), 'EEE, PP')}
          </p>
          <div className="flex items-center gap-2 text-sm text-text">
            {inAt ? (
              <>
                <AttendanceStatusBadge status={record.status} />
                <span>
                  Clocked in at {inAt}
                  {outAt && `, out at ${outAt}`}
                </span>
              </>
            ) : (
              <span>Not clocked in yet</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canClockIn && (
            <Button variant="success" isLoading={clockIn.isPending} disabled={busy} onClick={() => clockIn.mutate()}>
              Clock in
            </Button>
          )}
          {canClockOut && (
            <Button variant="secondary" isLoading={clockOut.isPending} disabled={busy} onClick={() => clockOut.mutate()}>
              Clock out
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="mb-2 text-sm font-medium text-text">Today&rsquo;s attendance</p>
      {body}
    </div>
  )
}
