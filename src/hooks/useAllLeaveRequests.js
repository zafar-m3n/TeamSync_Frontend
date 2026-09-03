import { useQuery } from '@tanstack/react-query'
import { getAllLeaveRequests } from '@/services/leaveRequestService'

export function useAllLeaveRequests(params) {
  return useQuery({
    queryKey: ['leave-requests', 'all', params],
    queryFn: () => getAllLeaveRequests(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
