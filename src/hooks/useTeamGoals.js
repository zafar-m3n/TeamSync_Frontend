import { useQuery } from '@tanstack/react-query'
import { getTeamGoals } from '@/services/goalService'

export function useTeamGoals(params) {
  return useQuery({
    queryKey: ['goals', 'team', params],
    queryFn: () => getTeamGoals(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
