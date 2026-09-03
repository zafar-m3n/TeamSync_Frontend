import { useQuery } from '@tanstack/react-query'
import { getAllTrainingDocuments } from '@/services/trainingDocumentService'

export function useAllTrainingDocuments(params) {
  return useQuery({
    queryKey: ['training', 'all-documents', params],
    queryFn: () => getAllTrainingDocuments(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
