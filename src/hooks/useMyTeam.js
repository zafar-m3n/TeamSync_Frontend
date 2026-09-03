import { useQuery } from '@tanstack/react-query'
import { getMyTeam } from '@/services/employeeService'

export function useMyTeam() {
  return useQuery({
    queryKey: ['employees', 'team'],
    queryFn: getMyTeam,
    select: (res) => res.data ?? [],
  })
}
