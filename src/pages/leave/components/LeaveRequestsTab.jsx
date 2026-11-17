import { useState } from 'react'
import { useAllLeaveRequests } from '@/hooks/useAllLeaveRequests'
import { useLeaveRequestFilters } from '@/pages/leave/hooks/useLeaveRequestFilters'
import LeaveRequestFilters from '@/pages/leave/components/LeaveRequestFilters'
import LeaveRequestsTable from '@/pages/leave/components/LeaveRequestsTable'
import ApproveLeaveModal from '@/pages/leave/components/ApproveLeaveModal'
import { CancelLeaveModal, RejectLeaveModal } from '@/pages/leave/components/LeaveDecisionModals'

export default function LeaveRequestsTab() {
  const { filters, params, setFilter, setPage } = useLeaveRequestFilters()
  // { kind: 'approve' | 'reject' | 'cancel', request } while a dialog is open.
  const [dialog, setDialog] = useState(null)
  const closeDialog = () => setDialog(null)
  const dialogRequest = (kind) => (dialog?.kind === kind ? dialog.request : null)

  const { data, isLoading, isFetching, isError, error, refetch } = useAllLeaveRequests(params)

  return (
    <div className="space-y-5">
      <LeaveRequestFilters filters={filters} onChange={setFilter} />

      <LeaveRequestsTable
        caption="Leave requests"
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyMessage="No leave requests match these filters"
        onAction={(kind, request) => setDialog({ kind, request })}
      />

      {dialog?.kind === 'approve' && <ApproveLeaveModal request={dialog.request} onClose={closeDialog} />}
      <RejectLeaveModal request={dialogRequest('reject')} onClose={closeDialog} />
      <CancelLeaveModal request={dialogRequest('cancel')} onClose={closeDialog} />
    </div>
  )
}
