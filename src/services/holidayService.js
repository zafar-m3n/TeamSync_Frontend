import api from '@/lib/axios'

export const getHolidays = (year) => api.get('/holidays', { params: { year } })
export const createHoliday = (data) => api.post('/holidays', data)
export const updateHoliday = (id, data) => api.patch(`/holidays/${id}`, data)
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`)
