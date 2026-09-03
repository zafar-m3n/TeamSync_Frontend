import api from '../lib/axios'

export const getLeaveTypes = () => api.get('/leave-types')
export const createLeaveType = (data) => api.post('/leave-types', data)
export const updateLeaveType = (id, data) => api.patch(`/leave-types/${id}`, data)
export const deleteLeaveType = (id) => api.delete(`/leave-types/${id}`)
