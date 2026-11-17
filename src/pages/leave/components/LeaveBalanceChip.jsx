import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '@/store/useAuth'
import { useLeaveBalance } from '@/hooks/useLeaveBalance'
import Skeleton from '@/components/ui/Skeleton'
import SetQuotaModal from '@/pages/leave/components/SetQuotaModal'
import { activeBalances } from '@/pages/leave/utils/leaveBalances'

const iconButton =
  'inline-flex h-5 w-5 items-center justify-center rounded text-fg-subtle transition-colors duration-(--duration-fast) hover:bg-surface-hover hover:text-fg focus-visible:focus-ring'

export default function LeaveBalanceChip({ employeeId, year }) {
  const { can } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [showQuota, setShowQuota] = useState(false)

  const resolvedYear = year ?? new Date().getFullYear()
  // Lazy: the query only runs once `expanded` is true — never per-row on load.
  const { data: balances, isLoading } = useLeaveBalance(employeeId, resolvedYear, expanded)
  const canSetQuota = can('leave', 'set_quota')
  const shown = activeBalances(balances)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-fg-muted transition-colors duration-(--duration-fast) hover:border-line-strong hover:text-fg focus-visible:focus-ring"
      >
        Balance
        <Icon icon="lucide:chevron-down" width="12" height="12" aria-hidden />
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-subtle py-0.5 pl-2 pr-1 text-xs">
      {isLoading ? (
        <span role="status" aria-label="Loading balance">
          <Skeleton className="h-3 w-24" />
        </span>
      ) : shown.length > 0 ? (
        <span className="text-fg">
          {shown.map((b) => (
            <span key={b.leaveTypeId} className="mr-2 whitespace-nowrap last:mr-0">
              {b.leaveTypeName}: <span className="font-medium tabular-nums">{b.remaining}/{b.totalDays}</span>
            </span>
          ))}
        </span>
      ) : (
        <span className="text-fg-subtle">No balance set</span>
      )}

      {canSetQuota && (
        <button type="button" onClick={() => setShowQuota(true)} aria-label="Set quota" className={iconButton}>
          <Icon icon="lucide:pencil" width="12" height="12" aria-hidden />
        </button>
      )}

      <button type="button" onClick={() => setExpanded(false)} aria-label="Collapse balance" className={iconButton}>
        <Icon icon="lucide:chevron-up" width="12" height="12" aria-hidden />
      </button>

      {showQuota && <SetQuotaModal employeeId={employeeId} year={resolvedYear} onClose={() => setShowQuota(false)} />}
    </span>
  )
}
