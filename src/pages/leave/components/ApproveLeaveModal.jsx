import { useQueries } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getLeaveBalance } from '@/services/leaveBalanceService'
import { useApproveLeaveRequest } from '@/hooks/useLeaveRequestMutations'
import { findBalance } from '@/pages/leave/utils/leaveBalances'

const dayLabel = (n) => `${n} day${n === 1 ? '' : 's'}`

export default function ApproveLeaveModal({ request, onClose }) {
  const approve = useApproveLeaveRequest()
  const employeeId = request.employee.id
  // A request crossing New Year is charged to each year's balance separately.
  const parts = Object.entries(request.daysByYear ?? {}).map(([year, days]) => ({
    year: Number(year),
    days,
  }))

  const balanceQueries = useQueries({
    queries: parts.map(({ year }) => ({
      queryKey: ['leave-balances', String(employeeId), year],
      queryFn: () => getLeaveBalance(employeeId, year),
      select: (res) => findBalance(res.data, request.leaveTypeId),
    })),
  })
  const isLoading = balanceQueries.some((q) => q.isLoading)
  const rows = parts.map((part, i) => ({ ...part, balance: balanceQueries[i].data ?? null }))
  const shortYears = rows.filter((r) => r.balance && r.days > r.balance.remaining)

  const typeName = rows[0]?.balance?.leaveTypeName ?? request.leaveType?.name ?? 'leave'
  const employeeName = request.employee?.fullName ?? 'This employee'

  return (
    <Modal
      centered
      isOpen
      onClose={onClose}
      title="Approve leave request"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={approve.isPending}>
            Cancel
          </Button>
          <Button
            variant="success"
            isLoading={approve.isPending}
            disabled={isLoading || shortYears.length > 0}
            onClick={() => approve.mutate(request.id, { onSuccess: onClose })}
          >
            Confirm
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-text">
        <p>
          {employeeName} is requesting <strong>{dayLabel(request.days)}</strong> of {typeName}.
        </p>
        {isLoading ? (
          <p className="text-gray-500">Checking their balance…</p>
        ) : (
          rows.map(({ year, days, balance }) =>
            balance ? (
              <p key={year}>
                {parts.length > 1 && (
                  <>
                    <strong>{dayLabel(days)}</strong> in {year}:{' '}
                  </>
                )}
                <strong>{balance.remaining}</strong> of {balance.totalDays} {typeName} days
                remaining in {year}.
              </p>
            ) : (
              <p key={year} className="text-gray-500">
                Their {year} balance could not be loaded.
              </p>
            ),
          )
        )}
        {shortYears.length > 0 && (
          <p className="text-sm text-red-600">
            Insufficient balance for {shortYears.map((r) => r.year).join(' and ')} — this
            request can&rsquo;t be approved as-is.
          </p>
        )}
      </div>
    </Modal>
  )
}
