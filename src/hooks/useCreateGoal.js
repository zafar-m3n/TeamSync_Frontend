import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGoal } from '@/services/goalService'
import { toast } from '@/hooks/useToast'

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createGoal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal created')
    },
    onError: (error) => toast.error(error.message),
  })
}
