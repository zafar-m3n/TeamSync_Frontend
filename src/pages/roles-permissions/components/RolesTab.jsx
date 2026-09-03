import { useState } from 'react'
import Table from '../../../components/ui/Table'
import TableSkeleton from '../../../components/ui/TableSkeleton'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { useRoles } from '../../../hooks/useRoles'
import NewRoleModal from './NewRoleModal'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
]

export default function RolesTab() {
  const { data: roles = [], isLoading, isError, error, refetch } = useRoles()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => setShowNew(true)}>
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
            </tr>
          )}
        />
      )}

      {showNew && <NewRoleModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
