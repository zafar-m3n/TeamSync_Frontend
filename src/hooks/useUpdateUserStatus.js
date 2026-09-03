import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserStatus } from '../services/userService'
import { toast } from './useToast'

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: (_res, { isActive }) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(isActive ? 'User activated' : 'User deactivated')
    },
    onError: (error) => toast.error(error.message),
  })
}
