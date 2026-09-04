import { RateCard } from '@/pages/dashboard/components/SystemSection'

// HR-specific cards for the unified KPI strip: the two rate cards only, built
// identically to System's. The Upcoming Leave / New Hires tables now live in
// AdminDashboardView's "Needs attention" section.
export default function WorkforceCards({ data }) {
  const { weeklyAttendanceRate, monthlyAttendanceRate } = data

  return (
    <>
      <RateCard label="Weekly Attendance Rate" rate={weeklyAttendanceRate} />
      <RateCard label="Monthly Attendance Rate" rate={monthlyAttendanceRate} />
    </>
  )
}
