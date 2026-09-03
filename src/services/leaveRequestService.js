import api from '../lib/axios'

export const getMyLeaveRequests = (params) => api.get('/leave-requests/me', { params })
export const getTeamLeaveRequests = (params) =>
  api.get('/leave-requests/team', { params })
export const getAllLeaveRequests = (params) => api.get('/leave-requests', { params })
export const submitLeaveRequest = (data) => api.post('/leave-requests', data)
export const approveLeaveRequest = (id) => api.patch(`/leave-requests/${id}/approve`)
export const rejectLeaveRequest = (id) => api.patch(`/leave-requests/${id}/reject`)
export const cancelLeaveRequest = (id) => api.patch(`/leave-requests/${id}/cancel`)
