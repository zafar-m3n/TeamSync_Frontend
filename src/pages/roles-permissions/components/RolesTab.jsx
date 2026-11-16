import { useState } from 'react'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useRoles } from '@/hooks/useRoles'
import RoleFormModal from '@/pages/roles-permissions/components/RoleFormModal'
import DeleteRoleModal from '@/pages/roles-permissions/components/DeleteRoleModal'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'actions', header: 'Actions' },
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
        <Button variant="accent" onClick={() => setFormTarget(null)}>
          New Role
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">{error?.message || 'Could not load roles.'}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={roles}
          emptyMessage="No roles yet"
          renderRow={(role) => (
            <tr key={role.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2 text-text">
                  {role.name}
                  {role.isCustom && <Badge tone="info">Custom</Badge>}
                </span>
              </td>
              <td className="px-4 py-3 text-text">{role.description || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <IconButton
                    icon="lucide:pencil"
                    label={`Edit ${role.name}`}
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormTarget(role)}
                  />
                  {role.isCustom && (
                    <IconButton
                      icon="lucide:trash-2"
                      label={`Delete ${role.name}`}
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(role.id)}
                    />
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {formTarget !== undefined && (
        <RoleFormModal
          key={formTarget?.id ?? 'new'}
          role={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      {deleteTarget && (
        <DeleteRoleModal
          key={deleteTarget.id}
          role={deleteTarget}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
