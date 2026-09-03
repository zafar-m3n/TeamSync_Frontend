import { useQuery } from '@tanstack/react-query'
import { getMyAssignments } from '@/services/trainingAssignmentService'

export function useMyAssignments(params) {
  return useQuery({
    queryKey: ['training', 'my-assignments', params],
    queryFn: () => getMyAssignments(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
