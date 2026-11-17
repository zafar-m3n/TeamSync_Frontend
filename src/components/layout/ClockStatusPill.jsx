import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import clsx from 'clsx'
import { useClockStatus } from '@/hooks/useClock'

const time = (value) => format(new Date(value), 'p')

// Read-only clock-in summary for the topbar; clocking in/out stays on the panel.
export default function ClockStatusPill({ enabled, to }) {
  const { data: status, isSuccess } = useClockStatus(enabled)
  if (!enabled || !isSuccess || !status) return null

  const record = status.record
  const state = record?.clockOut ? 'out' : record?.clockIn ? 'in' : 'none'
  const text = {
    in: `Clocked in · ${record?.clockIn ? time(record.clockIn) : ''}`,
    out: `Clocked out · ${record?.clockOut ? time(record.clockOut) : ''}`,
    none: 'Not clocked in',
  }[state]

  return (
    <Link
      to={to}
      className="hidden h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-cell font-medium text-fg-muted transition-colors hover:border-line-strong/60 hover:text-fg focus-visible:focus-ring md:inline-flex"
    >
      <span
        aria-hidden
        className={clsx(
          'h-2 w-2 rounded-full',
          state === 'in' ? 'bg-success shadow-[0_0_0_3px] shadow-success/20' : state === 'out' ? 'bg-fg-subtle' : 'bg-warning',
        )}
      />
      <span className="tabular-nums">{text}</span>
    </Link>
  )
}
