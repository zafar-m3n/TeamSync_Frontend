import { useNavigate } from 'react-router-dom'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { useMyTeam } from '@/hooks/useMyTeam'
import { Avatar, ListError, ListSkeleton, NameCell } from '@/pages/employees/list/EmployeeListParts'

const teamColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
]

export default function TeamList() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading, isError, error, refetch } = useMyTeam()

  if (isLoading) return <ListSkeleton columns={teamColumns} rows={5} />
  if (isError) {
    return (
      <ListError message={error?.message || 'Could not load your team.'} onRetry={() => refetch()} />
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table
          columns={teamColumns}
          rows={rows}
          emptyMessage="No direct reports yet"
          renderRow={(emp) => (
            <tr
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">
                <NameCell name={emp.fullName} />
              </td>
              <td className="px-4 py-3 text-text">
                {emp.department?.name ? <Badge tone="neutral">{emp.department.name}</Badge> : '—'}
              </td>
              <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
            </tr>
          )}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">No direct reports yet</p>
          </div>
        ) : (
          rows.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Avatar name={emp.fullName} className="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{emp.fullName ?? '—'}</p>
                  <p className="truncate text-xs text-gray-500">{emp.designation ?? '—'}</p>
                </div>
              </div>
              {emp.department?.name && (
                <div className="mt-3">
                  <Badge tone="neutral">{emp.department.name}</Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
