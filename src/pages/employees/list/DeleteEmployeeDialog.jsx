import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useDeleteEmployee } from '@/hooks/useEmployees'
import { toast } from '@/hooks/useToast'

export default function DeleteEmployeeDialog({ employee, onClose }) {
  const deleteMutation = useDeleteEmployee()

  return (
    <Modal
      isOpen={Boolean(employee)}
      onClose={onClose}
      title="Delete employee"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() =>
              deleteMutation.mutate(employee.id, {
                onSuccess: () => {
                  toast.success(`${employee.fullName} deleted`)
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
        Delete <strong>{employee?.fullName}</strong>? This can’t be undone.
      </p>
    </Modal>
  )
}
