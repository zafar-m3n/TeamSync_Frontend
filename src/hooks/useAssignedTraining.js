import { useQuery } from '@tanstack/react-query'
import { getAssignedTraining } from '@/services/trainingDocumentService'

export function useAssignedTraining() {
  return useQuery({
    queryKey: ['training', 'assigned-to-me'],
    queryFn: getAssignedTraining,
    select: (res) => res.data ?? [],
  })
}
