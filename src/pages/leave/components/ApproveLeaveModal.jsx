import { useQueries } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
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
    <ConfirmDialog
      isOpen
      onClose={onClose}
      title="Approve leave request"
      tone="success"
      confirmLabel="Confirm"
      isLoading={approve.isPending}
      confirmDisabled={isLoading || shortYears.length > 0}
      onConfirm={() => approve.mutate(request.id, { onSuccess: onClose })}
    >
      <p>
        <span className="text-fg">{employeeName}</span> is requesting{' '}
        <strong className="font-semibold text-fg">{dayLabel(request.days)}</strong> of {typeName}.
      </p>
      <div className="rounded-md border border-line bg-surface-subtle px-3 py-2.5">
        {isLoading ? (
          <div role="status" aria-label="Checking their balance" className="space-y-2">
            <Skeleton className="h-3 w-48" />
          </div>
        ) : (
          <ul className="space-y-1.5">
            {rows.map(({ year, days, balance }) => {
              const short = balance && days > balance.remaining
              return (
                <li key={year} className={clsx('flex items-start gap-2', short ? 'text-danger' : 'text-fg')}>
                  <Icon
                    icon={!balance ? 'lucide:circle-help' : short ? 'lucide:circle-x' : 'lucide:circle-check'}
                    width="15"
                    height="15"
                    aria-hidden
                    className={clsx('mt-0.5 shrink-0', !balance ? 'text-fg-subtle' : short ? 'text-danger' : 'text-success')}
                  />
                  {balance ? (
                    <span>
                      {parts.length > 1 && (
                        <>
                          <strong className="font-semibold">{dayLabel(days)}</strong> in {year}:{' '}
                        </>
                      )}
                      <strong className="font-semibold tabular-nums">{balance.remaining}</strong> of{' '}
                      <span className="tabular-nums">{balance.totalDays}</span> {typeName} days remaining in {year}.
                    </span>
                  ) : (
                    <span className="text-fg-muted">Their {year} balance could not be loaded.</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {shortYears.length > 0 && (
        <p className="text-danger">
          Insufficient balance for {shortYears.map((r) => r.year).join(' and ')} — this request can&rsquo;t be approved as-is.
        </p>
      )}
    </ConfirmDialog>
  )
}
