import api from '@/lib/axios'

export const getMyAssignments = (params) =>
  api.get('/training-assignments/mine', { params })
export const getAllTrainingAssignments = (params) =>
  api.get('/training-assignments', { params })
export const createAssignment = (data) => api.post('/training-assignments', data)
export const removeAssignment = (id) => api.delete(`/training-assignments/${id}`)
