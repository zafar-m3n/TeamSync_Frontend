import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useDeleteEmployee } from '@/hooks/useEmployees'
import { toast } from '@/hooks/useToast'

// `employee` opens the dialog; `onDeleted` runs after the success toast (defaults to onClose).
export default function DeleteEmployeeDialog({ employee, onClose, onDeleted = onClose }) {
  const deleteMutation = useDeleteEmployee()
  // Keeps the name on screen while the dialog animates out after `employee` clears.
  const [shown, setShown] = useState(employee)
  if (employee && employee !== shown) setShown(employee)

  return (
    <ConfirmDialog
      isOpen={Boolean(employee)}
      onClose={onClose}
      title="Delete employee"
      confirmLabel="Delete"
      tone="danger"
      isLoading={deleteMutation.isPending}
      onConfirm={() =>
        deleteMutation.mutate(employee.id, {
          onSuccess: () => {
            toast.success(`${employee.fullName} deleted`)
            onDeleted()
          },
        })
      }
    >
      <p>
        Delete <strong className="font-semibold text-fg">{shown?.fullName}</strong>? This can’t be undone.
      </p>
    </ConfirmDialog>
  )
}
