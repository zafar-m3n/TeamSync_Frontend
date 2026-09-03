import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/userService'

export function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}
