import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmployees, createEmployee } from '@/services/employeeService'

export function useEmployees(params) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })
}
