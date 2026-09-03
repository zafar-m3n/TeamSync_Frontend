import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAttendance } from '@/services/attendanceService'
import { toast } from '@/hooks/useToast'

export function useUpdateAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateAttendance(id, data),
    onSuccess: () => {
      // Broad prefix invalidation — refreshes me/team/all without tracking which view is mounted.
      qc.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance record updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
