import api from '../lib/axios'

export const getUsers = (params) => api.get('/users', { params })
export const updateUserStatus = (id, isActive) =>
  api.patch(`/users/${id}/status`, { isActive })
export const resetPassword = (id, newPassword) =>
  api.patch(`/users/${id}/password`, { newPassword })
