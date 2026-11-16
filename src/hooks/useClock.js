import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clockIn, clockOut, getMyClockStatus } from '@/services/attendanceService'
import { toast } from '@/hooks/useToast'

export function useClockStatus(enabled = true) {
  return useQuery({
    queryKey: ['attendance', 'me', 'today'],
    queryFn: getMyClockStatus,
    enabled,
    retry: false,
    select: (res) => res.data,
  })
}

const useClockMutation = (mutationFn, message) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => toast.success(message),
    onError: (error) => toast.error(error.message),
    // Refetch either way so the buttons match the server after a 409.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useClockIn = () => useClockMutation(clockIn, 'Clocked in')
export const useClockOut = () => useClockMutation(clockOut, 'Clocked out')
