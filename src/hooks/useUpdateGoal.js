import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateGoal } from '../services/goalService'
import { toast } from './useToast'

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
