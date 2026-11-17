import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useDeleteTrainingDocument } from '@/hooks/useTrainingMutations'

export default function DeleteDocumentModal({ document, onClose }) {
  const del = useDeleteTrainingDocument()

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      title="Delete training document"
      confirmLabel="Delete"
      tone="danger"
      isLoading={del.isPending}
      onConfirm={() => del.mutate(document.id, { onSuccess: onClose })}
    >
      <p>
        Delete <strong className="font-semibold text-fg">{document.title}</strong>? It will also be removed from everyone it
        is assigned to.
      </p>
    </ConfirmDialog>
  )
}
