import StatCard from '@/components/ui/StatCard'

export default function SystemSection({ data }) {
  const {
    totalUsers,
    inactiveUsers,
    totalPermissions,
    weeklyAttendanceRate,
    monthlyAttendanceRate,
  } = data

  return (
    <section>
      <h2 className="mb-3 text-xl text-primary">System</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={totalUsers} label="Total Users" />
        <StatCard value={inactiveUsers} label="Inactive Users" />
        <StatCard value={totalPermissions} label="Total Permissions" />
        <StatCard value={`${weeklyAttendanceRate}%`} label="Weekly Attendance Rate" />
        <StatCard value={`${monthlyAttendanceRate}%`} label="Monthly Attendance Rate" />
      </div>
    </section>
  )
}
