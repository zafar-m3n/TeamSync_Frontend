import api from '../lib/axios'

export const getMyProfile = () => api.get('/employees/me')
export const getEmployees = (params) => api.get('/employees', { params })
export const getMyTeam = () => api.get('/employees/team')
export const getEmployee = (id) => api.get(`/employees/${id}`)
export const createEmployee = (data) => api.post('/employees', data)
export const updateEmployee = (id, data) => api.patch(`/employees/${id}`, data)
export const assignShift = (id, shiftId) =>
  api.patch(`/employees/${id}/shift`, { shiftId })
export const uploadDocument = (id, formData) =>
  api.post(`/employees/${id}/documents`, formData)
export const deleteDocument = (id, documentId) =>
  api.delete(`/employees/${id}/documents/${documentId}`)
