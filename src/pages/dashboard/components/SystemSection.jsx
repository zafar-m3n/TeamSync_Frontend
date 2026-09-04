import { useEffect, useState } from 'react'
import clsx from 'clsx'
import ProgressBar from '@/components/ui/ProgressBar'
import { CountUp } from '@/hooks/useCountUp'

// Role-specific cards get a thin accent top border — the only signal that
// these belong to the viewer's role. Otherwise they match StatCard's markup.
const roleCardClass =
  'rounded-lg border border-gray-200 border-t-4 border-t-accent bg-white p-5'

const toneText = {
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
}

function RoleStatCard({ value, label }) {
  return (
    <div className={roleCardClass}>
      <p className="text-3xl font-semibold text-primary">
        <CountUp value={value} />
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

// Shared by System and Workforce. The rate is already rounded server-side.
export function RateCard({ label, rate }) {
  const tone = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger'
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(rate))
    return () => cancelAnimationFrame(id)
  }, [rate])

  return (
    <div className={roleCardClass}>
      <p className={clsx('text-3xl font-semibold', toneText[tone])}>{`${rate}%`}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      <div className="mt-3">
        <ProgressBar value={shown} tone={tone} />
      </div>
    </div>
  )
}

export default function SystemCards({ data }) {
  const {
    totalUsers,
    inactiveUsers,
    totalPermissions,
    weeklyAttendanceRate,
    monthlyAttendanceRate,
  } = data

  return (
    <>
      <RoleStatCard value={totalUsers} label="Total Users" />
      <RoleStatCard value={inactiveUsers} label="Inactive Users" />
      <RoleStatCard value={totalPermissions} label="Total Permissions" />
      <RateCard label="Weekly Attendance Rate" rate={weeklyAttendanceRate} />
      <RateCard label="Monthly Attendance Rate" rate={monthlyAttendanceRate} />
    </>
  )
}
