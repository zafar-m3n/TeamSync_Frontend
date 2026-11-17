import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createShift, updateShift, deleteShift } from '@/services/shiftService'
import { toast } from '@/hooks/useToast'

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

export function useDeleteShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteShift(id),
    onSuccess: () => {
      // Also refreshes the shift pickers, which read the same list.
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift deleted')
    },
    // SHIFT_HAS_EMPLOYEES: the backend message carries the count.
    onError: (error) => toast.error(error.message),
  })
}
