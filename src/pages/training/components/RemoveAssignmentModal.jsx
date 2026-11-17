import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useRemoveAssignment } from '@/hooks/useTrainingMutations'

export default function RemoveAssignmentModal({ assignment, onClose }) {
  const removeMutation = useRemoveAssignment()

  return (
    <ConfirmDialog
      isOpen={Boolean(assignment)}
      onClose={onClose}
      title="Remove assignment"
      confirmLabel="Remove"
      tone="danger"
      isLoading={removeMutation.isPending}
      onConfirm={() => removeMutation.mutate(assignment.id, { onSuccess: onClose })}
      message="Remove this training assignment? The document itself isn’t deleted."
    />
  )
}
