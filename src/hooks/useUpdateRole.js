import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRole } from '@/services/roleService'
import { toast } from '@/hooks/useToast'

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      // Role names also appear in the permissions matrix and the users list.
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['permissions'] })
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Role updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
