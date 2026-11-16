import { useMemo } from 'react'
import { toYmd } from '@/components/form/DatePicker'
import { useListFilters } from '@/hooks/useListFilters'
import { LIMIT } from '@/pages/leave/utils/leaveRequestList'

// All Leave filters: status and employee options, a start-date range, and the page.
export function useLeaveRequestFilters() {
  const { filters, page, setFilter, setPage } = useListFilters({
    status: null,
    employee: null,
    range: undefined,
  })
  const { status, employee, range } = filters

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(employee ? { employeeId: employee.value } : {}),
      ...(status ? { status: status.value } : {}),
      ...(range?.from ? { startDate: toYmd(range.from) } : {}),
      ...(range?.to ? { endDate: toYmd(range.to) } : {}),
    }),
    [page, employee, status, range],
  )

  return { filters, page, params, setFilter, setPage }
}
