import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recordActual } from '../services/goalService'
import { toast } from './useToast'

export function useRecordActual() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, actualValue }) => recordActual(id, actualValue),
    onSuccess: () => {
      // percentComplete is server-computed; the refetch below is what updates
      // each row's ProgressBar — never recalculated on the client.
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Progress recorded')
    },
    onError: (error) => toast.error(error.message),
  })
}
