import { format } from 'date-fns'

export function fmt(value, pattern) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern)
}

export function goalProgressText(goal) {
  if (goal.status) return goal.status
  if (typeof goal.progressPercentage === 'number') return `${goal.progressPercentage}%`
  if (goal.targetValue != null && goal.actualValue != null) {
    return `${goal.actualValue} / ${goal.targetValue}`
  }
  return '—'
}
