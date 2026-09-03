import { useQuery } from '@tanstack/react-query'
import { getPermissions } from '../services/permissionService'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    select: (res) => res.data ?? [],
  })
}
