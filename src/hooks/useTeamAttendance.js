import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTeamAttendance } from '@/services/attendanceService'

export function useTeamAttendance(params) {
  return useQuery({
    queryKey: ['attendance', 'team', params],
    queryFn: () => getTeamAttendance(params),
    placeholderData: keepPreviousData,
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
