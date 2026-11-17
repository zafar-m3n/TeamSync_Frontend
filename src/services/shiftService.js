import api from '@/lib/axios'

export const getShifts = () => api.get('/shifts')
export const createShift = (data) => api.post('/shifts', data)
export const updateShift = (id, data) => api.patch(`/shifts/${id}`, data)
export const deleteShift = (id) => api.delete(`/shifts/${id}`)
