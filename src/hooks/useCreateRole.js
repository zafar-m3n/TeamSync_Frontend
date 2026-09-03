import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRole } from '../services/roleService'
import { toast } from './useToast'

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created — set its permissions in the Permissions tab')
    },
    onError: (error) => toast.error(error.message),
  })
}
