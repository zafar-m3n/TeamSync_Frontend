import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from '@/services/holidayService'
import { toast } from '@/hooks/useToast'

export function useHolidays(year, enabled = true) {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: () => getHolidays(year),
    enabled,
    select: (res) => res.data ?? [],
  })
}

const useHolidayMutation = (mutationFn, message) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holidays'] })
      toast.success(message)
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useCreateHoliday = () => useHolidayMutation(createHoliday, 'Holiday added')
export const useUpdateHoliday = () =>
  useHolidayMutation(({ id, data }) => updateHoliday(id, data), 'Holiday updated')
export const useDeleteHoliday = () => useHolidayMutation(deleteHoliday, 'Holiday deleted')
