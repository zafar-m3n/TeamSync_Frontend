import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetPassword } from '../services/userService'
import { toast } from './useToast'

export function useResetPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newPassword }) => resetPassword(id, newPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Password reset successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}
