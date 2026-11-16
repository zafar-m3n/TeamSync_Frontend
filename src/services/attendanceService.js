import api from '@/lib/axios'

export const getMyAttendance = (params) => api.get('/attendance/me', { params })
export const getTeamAttendance = (params) => api.get('/attendance/team', { params })
export const getAllAttendance = (params) => api.get('/attendance', { params })
export const updateAttendance = (id, data) => api.patch(`/attendance/${id}`, data)
export const overrideAttendance = (id, status) =>
  api.patch(`/attendance/${id}/override`, { status })
export const getMyClockStatus = () => api.get('/attendance/me/today')
export const clockIn = () => api.post('/attendance/clock-in')
export const clockOut = () => api.post('/attendance/clock-out')
