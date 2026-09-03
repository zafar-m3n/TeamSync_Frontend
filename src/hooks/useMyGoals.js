import { useQuery } from '@tanstack/react-query'
import { getMyGoals } from '@/services/goalService'

export function useMyGoals(params) {
  return useQuery({
    queryKey: ['goals', 'me', params],
    queryFn: () => getMyGoals(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
