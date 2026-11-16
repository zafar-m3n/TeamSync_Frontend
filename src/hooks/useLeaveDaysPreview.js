import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { previewLeaveDays } from '@/services/leaveRequestService'

// Working days a date range would cost the signed-in employee (shift days minus holidays).
export function useLeaveDaysPreview({ startDate, endDate, isHalfDay }) {
  const enabled = Boolean(startDate && endDate && startDate <= endDate)
  return useQuery({
    queryKey: ['leave-requests', 'preview', startDate, endDate, isHalfDay],
    queryFn: () => previewLeaveDays({ startDate, endDate, isHalfDay }),
    enabled,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  })
}
