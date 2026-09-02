import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/departmentService'
import { toast } from './useToast'

export function useDepartments(params) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => getDepartments(params),
    select: (res) => ({ rows: res.data ?? [], meta: res.meta ?? null }),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createDepartment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Department created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Department updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Department deleted')
    },
    // error.message is already the backend's verbatim text (e.g. the
    // DEPARTMENT_HAS_EMPLOYEES message), normalized by lib/axios.js.
    onError: (error) => toast.error(error.message),
  })
}
