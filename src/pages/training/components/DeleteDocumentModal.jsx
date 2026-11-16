import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useDeleteTrainingDocument } from '@/hooks/useTrainingMutations'

export default function DeleteDocumentModal({ document, onClose }) {
  const del = useDeleteTrainingDocument()

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Delete training document"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={del.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={del.isPending}
            onClick={() => del.mutate(document.id, { onSuccess: onClose })}
          >
            Delete
          </Button>
        </>
      }
    >
      <p>
        Delete <strong>{document.title}</strong>? It will also be removed from
        everyone it is assigned to.
      </p>
    </Modal>
  )
}
