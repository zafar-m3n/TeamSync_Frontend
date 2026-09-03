import { differenceInCalendarDays } from 'date-fns'

export const computeLeaveDays = (startDate, endDate, isHalfDay) =>
  isHalfDay
    ? 0.5
    : differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1
