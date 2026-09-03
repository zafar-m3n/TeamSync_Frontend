import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useLeaveBalance } from '@/hooks/useLeaveBalance'
import { useApproveLeaveRequest } from '@/hooks/useLeaveRequestMutations'
import { computeLeaveDays } from '@/pages/leave/utils/computeLeaveDays'

export default function ApproveLeaveModal({ request, onClose }) {
  const year = new Date(request.startDate).getFullYear()
  const { data: balance, isLoading } = useLeaveBalance(request.employee.id, year)
  const approve = useApproveLeaveRequest()

  const days = computeLeaveDays(request.startDate, request.endDate, request.isHalfDay)
  const employeeName = request.employee?.fullName ?? 'This employee'
  const insufficient = balance != null && days > balance.remaining

  return (
    <Modal
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
            disabled={isLoading || insufficient}
            onClick={() => approve.mutate(request.id, { onSuccess: onClose })}
          >
            Confirm
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-text">
        {isLoading ? (
          <p className="text-gray-500">Checking their balance…</p>
        ) : balance ? (
          <p>
            {employeeName} is requesting <strong>{days}</strong> days. They have{' '}
            <strong>{balance.remaining}</strong> of {balance.totalDays} days remaining
            this year.
          </p>
        ) : (
          <p className="text-gray-500">
            {employeeName} is requesting <strong>{days}</strong> days. Their balance for{' '}
            {year} could not be loaded.
          </p>
        )}
        {insufficient && (
          <p className="text-sm text-red-600">
            Insufficient balance — this request can&rsquo;t be approved as-is.
          </p>
        )}
      </div>
    </Modal>
  )
}
