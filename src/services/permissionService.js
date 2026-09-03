import api from '@/lib/axios'

export const getPermissions = () => api.get('/permissions')
export const bulkUpdatePermissions = (updates) =>
  api.patch('/permissions/bulk', { updates })
