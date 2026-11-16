import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRole } from '@/services/roleService'
import { toast } from '@/hooks/useToast'

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['permissions'] })
      toast.success('Role deleted')
    },
    // ROLE_HAS_USERS: the list's count was stale; refresh it alongside the message.
    onError: (error) => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.error(error.message)
    },
  })
}
