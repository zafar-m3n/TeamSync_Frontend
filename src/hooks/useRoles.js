import { useQuery } from '@tanstack/react-query'
import { getRoles } from '../services/roleService'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    select: (res) => res.data ?? [],
  })
}
