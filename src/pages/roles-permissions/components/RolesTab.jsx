import { useState } from 'react'
import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useRoles } from '@/hooks/useRoles'
import RoleFormModal from '@/pages/roles-permissions/components/RoleFormModal'
import DeleteRoleModal from '@/pages/roles-permissions/components/DeleteRoleModal'

const columns = [
  {
    key: 'name',
    header: 'Name',
    className: 'whitespace-nowrap',
    render: (role) => (
      <span className="inline-flex items-center gap-2 font-medium text-fg">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon icon="lucide:shield" width="14" height="14" aria-hidden />
        </span>
        {role.name}
        {role.isCustom && <Badge tone="info">Custom</Badge>}
      </span>
    ),
  },
  { key: 'description', header: 'Description', className: 'text-fg-muted', render: (r) => r.description || <span className="text-fg-subtle">—</span> },
]

export default function RolesTab() {
  const { data: roles = [], isLoading, isError, error, refetch } = useRoles()
  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  // Looked up from the live list, so a refetch after a 409 shows the current user count.
  const [deleteId, setDeleteId] = useState(null)
  const deleteTarget = roles.find((r) => r.id === deleteId)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setFormTarget(null)}>
          <Icon icon="lucide:plus" width="16" height="16" aria-hidden />
          New Role
        </Button>
      </div>

      <Table
        caption="Roles"
        columns={columns}
        rows={roles}
        isLoading={isLoading}
        error={isError ? error?.message || 'Could not load roles.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:shield"
        emptyMessage="No roles yet"
        rowActions={(role) => (
          <>
            <IconButton icon="lucide:pencil" label={`Edit ${role.name}`} variant="ghost" size="sm" onClick={() => setFormTarget(role)} />
            {role.isCustom && (
              <IconButton
                icon="lucide:trash-2"
                label={`Delete ${role.name}`}
                variant="ghost-danger"
                size="sm"
                onClick={() => setDeleteId(role.id)}
              />
            )}
          </>
        )}
      />

      {formTarget !== undefined && (
        <RoleFormModal key={formTarget?.id ?? 'new'} role={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      {deleteTarget && <DeleteRoleModal key={deleteTarget.id} role={deleteTarget} onClose={() => setDeleteId(null)} />}
    </div>
  )
}
