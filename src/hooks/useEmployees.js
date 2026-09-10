import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmployees, createEmployee, deleteEmployee } from '@/services/employeeService'
import { toast } from '@/hooks/useToast'

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

export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
    // error.message is the backend's verbatim text (e.g. EMPLOYEE_HAS_REPORTS,
    // EMPLOYEE_IS_DEPARTMENT_HEAD), normalized by lib/axios.js — surface as-is.
    onError: (error) => toast.error(error.message),
  })
}
