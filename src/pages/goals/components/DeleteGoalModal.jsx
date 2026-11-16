import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useDeleteGoal } from '@/hooks/useDeleteGoal'

export default function DeleteGoalModal({ goal, onClose, onDeleted }) {
  const mutation = useDeleteGoal()

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Delete goal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={mutation.isPending}
            onClick={() =>
              mutation.mutate(goal.id, {
                onSuccess: () => {
                  onDeleted?.()
                  onClose()
                },
              })
            }
          >
            Delete
          </Button>
        </>
      }
    >
      <p>
        Delete <strong>{goal.title}</strong>
        {goal.employee?.fullName ? <> for {goal.employee.fullName}</> : null}? Any recorded actual
        is removed with it, and this can&rsquo;t be undone.
      </p>
    </Modal>
  )
}
