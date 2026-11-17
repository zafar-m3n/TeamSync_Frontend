import { useRef } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useDeleteRole } from '@/hooks/useDeleteRole'

// Roles still held by users can't be deleted; the server enforces it too (ROLE_HAS_USERS).
export default function DeleteRoleModal({ role, onClose }) {
  const mutation = useDeleteRole()
  const cancelRef = useRef(null)
  const userCount = Number(role.userCount ?? 0)
  const blocked = userCount > 0

  return (
    <Modal
      isOpen
      onClose={mutation.isPending ? undefined : onClose}
      title="Delete role"
      size="sm"
      centered
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {blocked ? 'Close' : 'Cancel'}
          </Button>
          {!blocked && (
            <Button variant="danger" isLoading={mutation.isPending} onClick={() => mutation.mutate(role.id, { onSuccess: onClose })}>
              Delete
            </Button>
          )}
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            blocked ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger',
          )}
        >
          <Icon icon={blocked ? 'lucide:users' : 'lucide:triangle-alert'} width="18" height="18" aria-hidden />
        </span>
        <div className="pt-1.5 text-sm text-fg-muted">
          {blocked ? (
            <p>
              <strong className="font-semibold text-fg">{role.name}</strong> is assigned to {userCount}{' '}
              {userCount === 1 ? 'user' : 'users'}. Give {userCount === 1 ? 'them' : 'those users'} another role (on their
              employee record) before deleting it.
            </p>
          ) : (
            <p>
              Delete <strong className="font-semibold text-fg">{role.name}</strong>? No users have this role. Its permissions
              are removed too, and this can&rsquo;t be undone.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
