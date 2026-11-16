import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useRemoveAssignment } from '@/hooks/useTrainingMutations'

export default function RemoveAssignmentModal({ assignment, onClose }) {
  const removeMutation = useRemoveAssignment()

  return (
    <Modal
      isOpen={Boolean(assignment)}
      onClose={onClose}
      title="Remove assignment"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={removeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={removeMutation.isPending}
            onClick={() =>
              removeMutation.mutate(assignment.id, {
                onSuccess: onClose,
              })
            }
          >
            Remove
          </Button>
        </>
      }
    >
      <p>Remove this training assignment? The document itself isn&rsquo;t deleted.</p>
    </Modal>
  )
}
