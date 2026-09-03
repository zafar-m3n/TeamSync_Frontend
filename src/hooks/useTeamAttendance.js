import { useQuery } from '@tanstack/react-query'
import { getTeamAttendance } from '../services/attendanceService'

export function useTeamAttendance(date) {
  return useQuery({
    queryKey: ['attendance', 'team', date],
    queryFn: () => getTeamAttendance(date),
    select: (res) => res.data ?? [],
  })
}
