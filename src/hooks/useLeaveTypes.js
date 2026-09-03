import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from '@/services/leaveTypeService'
import { toast } from '@/hooks/useToast'

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
    select: (res) => res.data ?? [],
  })
}

export function useCreateLeaveType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createLeaveType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-types'] })
      toast.success('Leave type created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateLeaveType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateLeaveType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-types'] })
      toast.success('Leave type updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteLeaveType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteLeaveType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-types'] })
      toast.success('Leave type deleted')
    },
    // error.message is the backend's verbatim text (e.g. LEAVE_TYPE_IN_USE).
    onError: (error) => toast.error(error.message),
  })
}
