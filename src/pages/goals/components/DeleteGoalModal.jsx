import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useDeleteGoal } from '@/hooks/useDeleteGoal'

export default function DeleteGoalModal({ goal, onClose, onDeleted }) {
  const mutation = useDeleteGoal()

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      title="Delete goal"
      confirmLabel="Delete"
      tone="danger"
      isLoading={mutation.isPending}
      onConfirm={() =>
        mutation.mutate(goal.id, {
          onSuccess: () => {
            onDeleted?.()
            onClose()
          },
        })
      }
    >
      <p>
        Delete <strong className="font-semibold text-fg">{goal.title}</strong>
        {goal.employee?.fullName ? <> for {goal.employee.fullName}</> : null}? Any recorded actual is removed with it, and
        this can&rsquo;t be undone.
      </p>
    </ConfirmDialog>
  )
}
