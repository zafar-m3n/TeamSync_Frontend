import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTeamLeaveRequests } from '@/services/leaveRequestService'

export function useTeamLeaveRequests(params) {
  return useQuery({
    queryKey: ['leave-requests', 'team', params],
    queryFn: () => getTeamLeaveRequests(params),
    placeholderData: keepPreviousData,
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
