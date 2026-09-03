import api from '../lib/axios'

export const getAssignedTraining = () =>
  api.get('/training-documents/assigned-to-me')
export const getMyUploads = (params) =>
  api.get('/training-documents/mine', { params })
export const getAllTrainingDocuments = (params) =>
  api.get('/training-documents', { params })
export const uploadDocument = (formData) =>
  api.post('/training-documents', formData)
