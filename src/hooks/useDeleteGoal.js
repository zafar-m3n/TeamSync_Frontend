import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteGoal } from '@/services/goalService'
import { toast } from '@/hooks/useToast'

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}
