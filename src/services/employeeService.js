import api from '../lib/axios'

export const getMyProfile = () => api.get('/employees/me')
