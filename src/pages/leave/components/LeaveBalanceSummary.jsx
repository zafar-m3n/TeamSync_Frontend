import Table from '@/components/ui/Table'
import { activeBalances } from '@/pages/leave/utils/leaveBalances'

const columns = [
  { key: 'leaveTypeName', header: 'Leave type', className: 'font-medium' },
  { key: 'totalDays', header: 'Total', align: 'right', className: 'tabular-nums' },
  { key: 'usedDays', header: 'Used', align: 'right', className: 'tabular-nums' },
  { key: 'remaining', header: 'Remaining', align: 'right', className: 'tabular-nums font-semibold text-success' },
]

export default function LeaveBalanceSummary({ balances, year, isLoading, error, onRetry }) {
  return (
    <Table
      caption={`Leave balance by type for ${year}`}
      columns={columns}
      rows={activeBalances(balances)}
      getRowKey={(b) => b.leaveTypeId}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingRows={2}
      emptyIcon="lucide:wallet"
      emptyMessage={`No leave balance set for ${year}.`}
    />
  )
}
