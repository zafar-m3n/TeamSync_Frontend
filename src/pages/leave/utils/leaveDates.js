import { format } from 'date-fns'

export function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

export function datesLabel(req) {
  if (req.isHalfDay) return `${fmtDate(req.startDate)} · Half day`
  if (req.startDate === req.endDate) return fmtDate(req.startDate)
  return `${fmtDate(req.startDate)} – ${fmtDate(req.endDate)}`
}
