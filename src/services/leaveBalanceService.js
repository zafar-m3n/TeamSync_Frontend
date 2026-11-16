import api from '@/lib/axios'

export const getLeaveBalance = (employeeId, year) =>
  api.get(
    employeeId === 'me' ? '/leave-balances/me' : `/leave-balances/${employeeId}`,
    { params: year ? { year } : {} },
  )

export const setLeaveQuota = (employeeId, year, leaveTypeId, totalDays) =>
  api.put(`/leave-balances/${employeeId}/${year}/${leaveTypeId}`, { totalDays })
