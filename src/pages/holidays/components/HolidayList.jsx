import { Icon } from '@iconify/react'
import Card from '@/components/ui/Card'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { describeError } from '@/lib/errors'
import { useHolidays } from '@/hooks/useHolidays'
import { formatHolidayDate } from '@/pages/holidays/utils/formatHolidayDate'

// Read-only list for anyone with holidays.view.
export default function HolidayList({ year }) {
  const { data: holidays = [], isLoading, isError, error, refetch, isRefetching } = useHolidays(year)

  return (
    <Card
      padding="none"
      title={
        <span className="flex items-center gap-2">
          <Icon icon="lucide:party-popper" width="16" height="16" className="text-fg-muted" aria-hidden />
          Holidays in {year}
        </span>
      }
    >
      {isLoading ? (
        <LoadingRegion label="Loading holidays" className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-40" />
        </LoadingRegion>
      ) : isError ? (
        <ErrorState compact {...describeError(error, 'Could not load holidays.')} onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : holidays.length === 0 ? (
        <EmptyState compact icon="lucide:calendar" message={`No holidays listed for ${year}.`} />
      ) : (
        <ul className="divide-y divide-line text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex justify-between gap-4 px-5 py-2.5">
              <span className="font-medium text-fg">{h.name}</span>
              <span className="whitespace-nowrap tabular-nums text-fg-muted">{formatHolidayDate(h.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
