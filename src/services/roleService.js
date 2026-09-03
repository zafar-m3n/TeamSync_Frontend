import api from '../lib/axios'

export const getRoles = () => api.get('/roles')
export const createRole = (data) => api.post('/roles', data)
