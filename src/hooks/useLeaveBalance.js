import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeaveBalance, setLeaveQuota } from '@/services/leaveBalanceService'
import { toast } from '@/hooks/useToast'

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
    // quotas: [{ leaveTypeId, totalDays }] — one PUT per changed type.
    mutationFn: ({ employeeId, year, quotas }) =>
      Promise.all(
        quotas.map((q) => setLeaveQuota(employeeId, year, q.leaveTypeId, q.totalDays)),
      ),
    onSuccess: () => toast.success('Leave balance updated'),
    onError: (error) => toast.error(error.message),
    // Refetch even on a partial failure so the table shows what actually saved.
    onSettled: () => qc.invalidateQueries({ queryKey: ['leave-balances'] }),
  })
}
