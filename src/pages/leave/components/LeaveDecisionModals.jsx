import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import {
  useRejectLeaveRequest,
  useCancelLeaveRequest,
} from '@/hooks/useLeaveRequestMutations'

export function RejectLeaveModal({ request, onClose }) {
  const rejectMutation = useRejectLeaveRequest()

  return (
    <Modal
      centered
      isOpen={Boolean(request)}
      onClose={onClose}
      title="Reject leave request"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={rejectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={rejectMutation.isPending}
            onClick={() =>
              rejectMutation.mutate(request.id, {
                onSuccess: onClose,
              })
            }
          >
            Reject
          </Button>
        </>
      }
    >
      <p>
        Reject this leave request from{' '}
        <strong>{request?.employee?.fullName ?? 'this employee'}</strong>?
      </p>
    </Modal>
  )
}

export function CancelLeaveModal({ request, onClose }) {
  const cancelMutation = useCancelLeaveRequest()

  return (
    <Modal
      centered
      isOpen={Boolean(request)}
      onClose={onClose}
      title="Cancel leave request"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={cancelMutation.isPending}
          >
            Keep it
          </Button>
          <Button
            variant="danger"
            isLoading={cancelMutation.isPending}
            onClick={() =>
              cancelMutation.mutate(request.id, {
                onSuccess: onClose,
              })
            }
          >
            Cancel request
          </Button>
        </>
      }
    >
      <p>Cancel this leave request? This can&rsquo;t be undone.</p>
    </Modal>
  )
}
