import { useState } from 'react'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import { useAllLeaveRequests } from '@/hooks/useAllLeaveRequests'
import { useLeaveRequestFilters } from '@/pages/leave/hooks/useLeaveRequestFilters'
import { LIMIT, leaveRequestColumns } from '@/pages/leave/utils/leaveRequestList'
import LeaveRequestFilters from '@/pages/leave/components/LeaveRequestFilters'
import LeaveRequestsTable from '@/pages/leave/components/LeaveRequestsTable'
import ApproveLeaveModal from '@/pages/leave/components/ApproveLeaveModal'
import { CancelLeaveModal, RejectLeaveModal } from '@/pages/leave/components/LeaveDecisionModals'

export default function LeaveRequestsTab() {
  const { filters, page, params, setFilter, setPage } = useLeaveRequestFilters()
  // { kind: 'approve' | 'reject' | 'cancel', request } while a dialog is open.
  const [dialog, setDialog] = useState(null)
  const closeDialog = () => setDialog(null)
  const dialogRequest = (kind) => (dialog?.kind === kind ? dialog.request : null)

  const { data, isLoading, isError, error, refetch } = useAllLeaveRequests(params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <LeaveRequestFilters filters={filters} onChange={setFilter} />

      {isLoading ? (
        <TableSkeleton columns={leaveRequestColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load leave requests.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <LeaveRequestsTable rows={rows} onAction={(kind, request) => setDialog({ kind, request })} />

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {meta.page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {dialog?.kind === 'approve' && (
        <ApproveLeaveModal request={dialog.request} onClose={closeDialog} />
      )}
      <RejectLeaveModal request={dialogRequest('reject')} onClose={closeDialog} />
      <CancelLeaveModal request={dialogRequest('cancel')} onClose={closeDialog} />
    </div>
  )
}
