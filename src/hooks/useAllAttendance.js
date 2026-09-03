import { useQuery } from '@tanstack/react-query'
import { getAllAttendance } from '@/services/attendanceService'

export function useAllAttendance(params) {
  return useQuery({
    queryKey: ['attendance', 'all', params],
    queryFn: () => getAllAttendance(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
