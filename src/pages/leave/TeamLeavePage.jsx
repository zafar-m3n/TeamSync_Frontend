import { useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import { useTeamLeaveRequests } from '@/hooks/useTeamLeaveRequests'
import LeaveRequestsTable from '@/pages/leave/components/LeaveRequestsTable'
import ApproveLeaveModal from '@/pages/leave/components/ApproveLeaveModal'
import { CancelLeaveModal, RejectLeaveModal } from '@/pages/leave/components/LeaveDecisionModals'
import { LIMIT } from '@/pages/leave/utils/leaveRequestList'

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled']
const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...STATUSES.map((s) => ({ value: s, label: s }))]

export default function TeamLeavePage() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  // { kind: 'approve' | 'reject' | 'cancel', request } while a dialog is open.
  const [dialog, setDialog] = useState(null)
  const closeDialog = () => setDialog(null)
  const dialogRequest = (kind) => (dialog?.kind === kind ? dialog.request : null)

  const params = useMemo(() => ({ page, limit: LIMIT, ...(status !== 'all' ? { status } : {}) }), [page, status])
  const { data, isLoading, isFetching, isError, error, refetch } = useTeamLeaveRequests(params)

  return (
    <div className="space-y-5">
      <div className="w-full sm:w-48">
        <FormField label="Status">
          <Select
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find((o) => o.value === status) ?? null}
            onChange={(opt) => {
              setStatus(opt.value)
              setPage(1)
            }}
          />
        </FormField>
      </div>

      <LeaveRequestsTable
        caption="Team leave requests"
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyMessage="No leave requests from your team"
        onAction={(kind, request) => setDialog({ kind, request })}
      />

      {dialog?.kind === 'approve' && <ApproveLeaveModal request={dialog.request} onClose={closeDialog} />}
      <RejectLeaveModal request={dialogRequest('reject')} onClose={closeDialog} />
      <CancelLeaveModal request={dialogRequest('cancel')} onClose={closeDialog} />
    </div>
  )
}
