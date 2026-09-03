import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getShift, createShift, updateShift } from '@/services/shiftService'
import { toast } from '@/hooks/useToast'

export function useShift(id) {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => getShift(id),
    enabled: id != null,
    select: (res) => res.data,
  })
}

export function useCreateShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createShift(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateShift(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
