import Table from '@/components/ui/Table'
import { useAuth } from '@/store/useAuth'
import { useMyProfile } from '@/hooks/useMyProfile'
import { datesLabel } from '@/pages/leave/utils/leaveDates'
import { LIMIT } from '@/pages/leave/utils/leaveRequestList'
import LeaveStatusBadge from '@/pages/leave/components/LeaveStatusBadge'
import LeaveBalanceChip from '@/pages/leave/components/LeaveBalanceChip'
import LeaveRequestActions from '@/pages/leave/components/LeaveRequestActions'

const columns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  { key: 'leaveType', header: 'Leave Type', render: (r) => r.leaveType?.name ?? '—' },
  { key: 'dates', header: 'Dates', className: 'whitespace-nowrap tabular-nums', render: datesLabel },
  { key: 'days', header: 'Days', align: 'right', className: 'tabular-nums' },
  { key: 'status', header: 'Status', render: (r) => <LeaveStatusBadge status={r.status} /> },
  {
    key: 'balance',
    header: 'Balance',
    render: (r) =>
      r.employee?.id != null && <LeaveBalanceChip employeeId={r.employee.id} year={new Date(r.startDate).getFullYear()} />,
  },
]

// Requests with employee, balance and actions (Team Leave and All Leave).
// onAction(kind, request) with kind 'approve' | 'reject' | 'cancel'; the rest are Table props.
export default function LeaveRequestsTable({ onAction, ...tableProps }) {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  return (
    <Table
      columns={columns}
      loadingRows={LIMIT}
      emptyIcon="lucide:calendar-x"
      rowActions={(req) => (
        <LeaveRequestActions request={req} currentUser={user} currentEmployeeId={currentEmployeeId} onAction={onAction} />
      )}
      {...tableProps}
    />
  )
}
