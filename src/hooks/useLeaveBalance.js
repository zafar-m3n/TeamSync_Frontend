import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeaveBalance, setLeaveQuota } from '../services/leaveBalanceService'
import { toast } from './useToast'

export function useLeaveBalance(employeeId, year, enabled = true) {
  return useQuery({
    queryKey: ['leave-balances', String(employeeId), year],
    queryFn: () => getLeaveBalance(employeeId, year),
    enabled: enabled && employeeId != null,
    select: (res) => res.data,
  })
}

export function useSetLeaveQuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, year, totalDays }) =>
      setLeaveQuota(employeeId, year, totalDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-balances'] })
      toast.success('Leave balance updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
