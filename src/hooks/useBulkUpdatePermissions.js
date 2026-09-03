import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkUpdatePermissions } from '../services/permissionService'
import { toast } from './useToast'

export function useBulkUpdatePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates) => bulkUpdatePermissions(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] })
      toast.success('Permissions updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
