import api from '@/lib/axios'

export const getMyAttendance = (params) => api.get('/attendance/me', { params })
export const getTeamAttendance = (date) =>
  api.get('/attendance/team', { params: date ? { date } : {} })
export const getAllAttendance = (params) => api.get('/attendance', { params })
export const updateAttendance = (id, data) => api.patch(`/attendance/${id}`, data)
export const overrideAttendance = (id, status) =>
  api.patch(`/attendance/${id}/override`, { status })
