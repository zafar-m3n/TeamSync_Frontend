import { useQuery } from '@tanstack/react-query'
import { getTeamLeaveRequests } from '../services/leaveRequestService'

export function useTeamLeaveRequests(params) {
  return useQuery({
    queryKey: ['leave-requests', 'team', params],
    queryFn: () => getTeamLeaveRequests(params),
    select: (res) => res.data ?? [],
  })
}
