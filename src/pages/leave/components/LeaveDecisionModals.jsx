import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useRejectLeaveRequest, useCancelLeaveRequest } from '@/hooks/useLeaveRequestMutations'

// Keeps the last request on screen while the dialog animates out after `request` clears.
function useShown(request) {
  const [shown, setShown] = useState(request)
  if (request && request !== shown) setShown(request)
  return shown
}

export function RejectLeaveModal({ request, onClose }) {
  const rejectMutation = useRejectLeaveRequest()
  const shown = useShown(request)

  return (
    <ConfirmDialog
      isOpen={Boolean(request)}
      onClose={onClose}
      title="Reject leave request"
      confirmLabel="Reject"
      tone="danger"
      isLoading={rejectMutation.isPending}
      onConfirm={() => rejectMutation.mutate(request.id, { onSuccess: onClose })}
    >
      <p>
        Reject this leave request from{' '}
        <strong className="font-semibold text-fg">{shown?.employee?.fullName ?? 'this employee'}</strong>?
      </p>
    </ConfirmDialog>
  )
}

export function CancelLeaveModal({ request, onClose }) {
  const cancelMutation = useCancelLeaveRequest()

  return (
    <ConfirmDialog
      isOpen={Boolean(request)}
      onClose={onClose}
      title="Cancel leave request"
      confirmLabel="Cancel request"
      cancelLabel="Keep it"
      tone="danger"
      isLoading={cancelMutation.isPending}
      onConfirm={() => cancelMutation.mutate(request.id, { onSuccess: onClose })}
      message="Cancel this leave request? This can’t be undone."
    />
  )
}
