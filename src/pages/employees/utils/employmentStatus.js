// Mirrors the backend's employment status rules (services/employmentStatusService.js).
export const EMPLOYMENT_STATUSES = ['Active', 'Probation', 'Suspended', 'Resigned', 'Terminated']
const LEAVING_STATUSES = ['Resigned', 'Terminated']

export const isLeaving = (status) => LEAVING_STATUSES.includes(status)

export const STATUS_TONE = {
  Active: 'success',
  Probation: 'info',
  Suspended: 'warning',
  Resigned: 'neutral',
  Terminated: 'danger',
}
