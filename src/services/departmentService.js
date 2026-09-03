import api from '@/lib/axios'

export const getDepartments = (params) => api.get('/departments', { params })
export const getDepartment = (id) => api.get(`/departments/${id}`)
export const createDepartment = (data) => api.post('/departments', data)
export const updateDepartment = (id, data) => api.patch(`/departments/${id}`, data)
export const deleteDepartment = (id) => api.delete(`/departments/${id}`)
