import { useQuery } from '@tanstack/react-query'
import { getMyAttendance } from '../services/attendanceService'

export function useMyAttendance(params) {
  return useQuery({
    queryKey: ['attendance', 'me', params],
    queryFn: () => getMyAttendance(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
