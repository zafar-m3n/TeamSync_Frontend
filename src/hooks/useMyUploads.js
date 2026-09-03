import { useQuery } from '@tanstack/react-query'
import { getMyUploads } from '../services/trainingDocumentService'

export function useMyUploads(params) {
  return useQuery({
    queryKey: ['training', 'my-uploads', params],
    queryFn: () => getMyUploads(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
