import api from '../lib/axios'

export const getRoles = () => api.get('/roles')
