import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { describeError } from '@/lib/errors'
import { parseYmd } from '@/components/form/DatePicker'
import { useClockIn, useClockOut, useClockStatus } from '@/hooks/useClock'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'

const time = (value) => (value ? format(new Date(value), 'p') : null)
const hhmm = (t) => t?.slice(0, 5)

// Current wall-clock time, refreshed every 15 seconds (no animation).
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  return now
}

function LiveTime() {
  const now = useNow()
  return (
    <p className="font-display text-4xl font-semibold leading-none tabular-nums text-fg">
      <time dateTime={now.toISOString()}>{format(now, 'p')}</time>
    </p>
  )
}

/**
 * Clock in / clock out for the signed-in employee's current shift.
 * `prominent` (My Attendance) shows a live clock and a wide layout; the default
 * is the compact dashboard card.
 */
export default function ClockPanel({ prominent = false }) {
  const { data: status, isLoading, isError, error, refetch, isRefetching } = useClockStatus()
  const clockIn = useClockIn()
  const clockOut = useClockOut()
  const busy = clockIn.isPending || clockOut.isPending

  let info
  let actions = null
  if (isLoading) {
    info = (
      <div role="status" aria-label="Loading today’s shift" className="flex flex-col gap-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
    actions = <Skeleton className={clsx('h-11', prominent ? 'w-44' : 'w-full')} />
  } else if (isError) {
    info =
      error?.code === 'NO_SHIFT_ASSIGNED' ? (
        <p className="text-sm text-fg-muted">You have no shift assigned yet, so clocking in is unavailable.</p>
      ) : (
        <ErrorState
          compact
          {...describeError(error, 'Could not load your shift.')}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      )
  } else {
    const { shift, shiftDay, record, canClockIn, canClockOut } = status
    const inAt = time(record?.clockIn)
    const outAt = time(record?.clockOut)
    info = (
      <div className="flex flex-col gap-1.5">
        <p className="text-cell text-fg-muted">
          {shift.name} · <span className="tabular-nums">{hhmm(shift.startTime)}–{hhmm(shift.endTime)}</span> ·{' '}
          {format(parseYmd(shiftDay), 'EEE, PP')}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-fg">
          {inAt ? (
            <>
              <AttendanceStatusBadge status={record.status} />
              <span className="tabular-nums">
                Clocked in at {inAt}
                {outAt && `, out at ${outAt}`}
              </span>
            </>
          ) : (
            <span>Not clocked in yet</span>
          )}
        </div>
      </div>
    )
    if (canClockIn || canClockOut) {
      actions = (
        <div className={clsx('flex gap-2', prominent && 'sm:min-w-44')}>
          {canClockIn && (
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              isLoading={clockIn.isPending}
              disabled={busy}
              onClick={() => clockIn.mutate()}
            >
              <Icon icon="lucide:log-in" width="18" height="18" aria-hidden />
              Clock in
            </Button>
          )}
          {canClockOut && (
            <Button
              variant={prominent ? 'dark' : 'secondary'}
              size="lg"
              className="flex-1"
              isLoading={clockOut.isPending}
              disabled={busy}
              onClick={() => clockOut.mutate()}
            >
              <Icon icon="lucide:log-out" width="18" height="18" aria-hidden />
              Clock out
            </Button>
          )}
        </div>
      )
    }
  }

  if (prominent) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-brand-500 to-brand-700"
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex">
              <Icon icon="lucide:clock" width="22" height="22" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-3">
              <div>
                <h2 className="text-cell font-medium text-fg-muted">Today&rsquo;s attendance</h2>
                <LiveTime />
              </div>
              {info}
            </div>
          </div>
          {actions}
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-cell font-medium text-fg-muted">Today&rsquo;s attendance</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon icon="lucide:clock" width="16" height="16" aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {info}
        {actions}
      </div>
    </section>
  )
}
