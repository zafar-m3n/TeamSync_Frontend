import { useMutation, useQueryClient } from '@tanstack/react-query'
import { overrideAttendance } from '@/services/attendanceService'
import { toast } from '@/hooks/useToast'

export function useOverrideAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => overrideAttendance(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance corrected')
    },
    onError: (error) => toast.error(error.message),
  })
}
