import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useDeleteRole } from '@/hooks/useDeleteRole'

// Roles still held by users can't be deleted; the server enforces it too (ROLE_HAS_USERS).
export default function DeleteRoleModal({ role, onClose }) {
  const mutation = useDeleteRole()
  const userCount = Number(role.userCount ?? 0)
  const blocked = userCount > 0

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Delete role"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {blocked ? 'Close' : 'Cancel'}
          </Button>
          {!blocked && (
            <Button
              variant="danger"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate(role.id, { onSuccess: onClose })}
            >
              Delete
            </Button>
          )}
        </>
      }
    >
      {blocked ? (
        <p>
          <strong>{role.name}</strong> is assigned to {userCount}{' '}
          {userCount === 1 ? 'user' : 'users'}. Give {userCount === 1 ? 'them' : 'those users'}{' '}
          another role (on their employee record) before deleting it.
        </p>
      ) : (
        <p>
          Delete <strong>{role.name}</strong>? No users have this role. Its permissions are removed
          too, and this can&rsquo;t be undone.
        </p>
      )}
    </Modal>
  )
}
