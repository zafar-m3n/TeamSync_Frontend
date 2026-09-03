import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
} from '@/services/leaveRequestService'
import { toast } from '@/hooks/useToast'

export function useSubmitLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => submitLeaveRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Leave request submitted')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useApproveLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => approveLeaveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['leave-balances'] })
      toast.success('Leave request approved')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useRejectLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => rejectLeaveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Leave request rejected')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useCancelLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => cancelLeaveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['leave-balances'] })
      toast.success('Leave request cancelled')
    },
    onError: (error) => toast.error(error.message),
  })
}
