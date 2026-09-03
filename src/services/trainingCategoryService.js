import api from '../lib/axios'

export const getTrainingCategories = () => api.get('/training-categories')
export const createTrainingCategory = (data) => api.post('/training-categories', data)
export const updateTrainingCategory = (id, data) =>
  api.patch(`/training-categories/${id}`, data)
export const deleteTrainingCategory = (id) => api.delete(`/training-categories/${id}`)
