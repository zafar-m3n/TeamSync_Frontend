import api from '@/lib/axios'

export const getMyGoals = (params) => api.get('/goals/me', { params })
export const getTeamGoals = (params) => api.get('/goals/team', { params })
export const getAllGoals = (params) => api.get('/goals', { params })
export const createGoal = (data) => api.post('/goals', data)
export const updateGoal = (id, data) => api.patch(`/goals/${id}`, data)
export const recordActual = (id, actualValue) =>
  api.patch(`/goals/${id}/actual`, { actualValue })
