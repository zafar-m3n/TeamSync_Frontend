import { useQuery } from '@tanstack/react-query'
import { getAllTrainingAssignments } from '../services/trainingAssignmentService'

export function useAllTrainingAssignments(params) {
  return useQuery({
    queryKey: ['training', 'all-assignments', params],
    queryFn: () => getAllTrainingAssignments(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
