import api from '@/lib/axios'

export const getRoles = () => api.get('/roles')
export const createRole = (data) => api.post('/roles', data)
export const updateRole = (id, data) => api.patch(`/roles/${id}`, data)
