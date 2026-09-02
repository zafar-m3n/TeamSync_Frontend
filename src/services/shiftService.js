import api from '../lib/axios'

export const getShifts = () => api.get('/shifts')
export const getShift = (id) => api.get(`/shifts/${id}`)
export const createShift = (data) => api.post('/shifts', data)
export const updateShift = (id, data) => api.patch(`/shifts/${id}`, data)
