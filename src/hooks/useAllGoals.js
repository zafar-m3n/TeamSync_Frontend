import { useQuery } from '@tanstack/react-query'
import { getAllGoals } from '../services/goalService'

export function useAllGoals(params) {
  return useQuery({
    queryKey: ['goals', 'all', params],
    queryFn: () => getAllGoals(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
