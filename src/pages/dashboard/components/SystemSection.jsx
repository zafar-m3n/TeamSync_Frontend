import { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { CountUp } from '@/hooks/useMotion'

// Role-specific cards carry the brand top rule (`accent`) — the only signal that
// they belong to the viewer's role.
function RoleStatCard({ value, label, icon }) {
  return <StatCard accent value={<CountUp value={value} />} label={label} icon={icon} />
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
    <StatCard accent value={`${rate}%`} label={label} tone={tone} icon="lucide:trending-up">
      <ProgressBar value={shown} tone={tone} />
    </StatCard>
  )
}

export default function SystemCards({ data }) {
  const { totalUsers, inactiveUsers, totalPermissions, weeklyAttendanceRate, monthlyAttendanceRate } = data

  return (
    <>
      <RoleStatCard value={totalUsers} label="Total Users" icon="lucide:users" />
      <RoleStatCard value={inactiveUsers} label="Inactive Users" icon="lucide:user-minus" />
      <RoleStatCard value={totalPermissions} label="Total Permissions" icon="lucide:key-round" />
      <RateCard label="Weekly Attendance Rate" rate={weeklyAttendanceRate} />
      <RateCard label="Monthly Attendance Rate" rate={monthlyAttendanceRate} />
    </>
  )
}
