import { useQuery } from '@tanstack/react-query'
import { getMyLeaveRequests } from '../services/leaveRequestService'

export function useMyLeaveRequests(params) {
  return useQuery({
    queryKey: ['leave-requests', 'me', params],
    queryFn: () => getMyLeaveRequests(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
