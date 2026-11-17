import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '@/store/useAuth'
import { useLeaveBalance } from '@/hooks/useLeaveBalance'
import SetQuotaModal from '@/pages/leave/components/SetQuotaModal'
import { activeBalances } from '@/pages/leave/utils/leaveBalances'

export default function LeaveBalanceChip({ employeeId, year }) {
  const { can } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [showQuota, setShowQuota] = useState(false)

  const resolvedYear = year ?? new Date().getFullYear()
  // Lazy: the query only runs once `expanded` is true — never per-row on load.
  const { data: balances, isLoading } = useLeaveBalance(
    employeeId,
    resolvedYear,
    expanded,
  )
  const canSetQuota = can('leave', 'set_quota')
  const shown = activeBalances(balances)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Balance
        <Icon icon="lucide:chevron-down" width="12" height="12" />
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs">
      {isLoading ? (
        <span className="text-gray-400">Loading…</span>
      ) : shown.length > 0 ? (
        <span className="text-text">
          {shown.map((b) => (
            <span key={b.leaveTypeId} className="mr-2 whitespace-nowrap last:mr-0">
              {b.leaveTypeName}: {b.remaining}/{b.totalDays}
            </span>
          ))}
        </span>
      ) : (
        <span className="text-gray-400">No balance set</span>
      )}

      {canSetQuota && (
        <button
          type="button"
          onClick={() => setShowQuota(true)}
          aria-label="Set quota"
          className="text-gray-400 transition-colors hover:text-text"
        >
          <Icon icon="lucide:pencil" width="12" height="12" />
        </button>
      )}

      <button
        type="button"
        onClick={() => setExpanded(false)}
        aria-label="Collapse balance"
        className="text-gray-400 transition-colors hover:text-text"
      >
        <Icon icon="lucide:chevron-up" width="12" height="12" />
      </button>

      {showQuota && (
        <SetQuotaModal
          employeeId={employeeId}
          year={resolvedYear}
          onClose={() => setShowQuota(false)}
        />
      )}
    </span>
  )
}
