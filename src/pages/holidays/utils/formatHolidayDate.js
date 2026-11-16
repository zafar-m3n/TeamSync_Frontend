import { format } from 'date-fns'
import { parseYmd } from '@/components/form/DatePicker'

// Holiday dates are plain YYYY-MM-DD; parse locally so they never shift a day.
export const formatHolidayDate = (ymd) => {
  const d = parseYmd(ymd)
  return d ? format(d, 'EEE, PP') : '—'
}
