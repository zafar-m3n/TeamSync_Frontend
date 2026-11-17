import { useNavigate } from 'react-router-dom'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { useMyTeam } from '@/hooks/useMyTeam'
import { MobileCard, MobileListState, NameCell } from '@/pages/employees/list/EmployeeListParts'

const EMPTY_MESSAGE = 'No direct reports yet'

const teamColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
]

export default function TeamList() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading, isError, error, refetch } = useMyTeam()
  const errorMessage = isError ? error : null

  return (
    <>
      <div className="hidden md:block">
        <Table
          caption="My team"
          columns={teamColumns}
          rows={rows}
          isLoading={isLoading}
          error={errorMessage}
          onRetry={() => refetch()}
          emptyMessage={EMPTY_MESSAGE}
          emptyIcon="lucide:users"
          renderRow={(emp) => (
            <tr
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer border-b border-line transition-colors duration-(--duration-fast) last:border-0 hover:bg-surface-subtle"
            >
              <td className="px-4 py-2.5">
                <NameCell name={emp.fullName} />
              </td>
              <td className="px-4 py-2.5 text-fg">
                {emp.department?.name ? <Badge tone="neutral">{emp.department.name}</Badge> : <span className="text-fg-subtle">—</span>}
              </td>
              <td className="px-4 py-2.5 text-fg">{emp.designation ?? '—'}</td>
            </tr>
          )}
        />
      </div>

      <div className="space-y-3 md:hidden">
        <MobileListState isLoading={isLoading} error={errorMessage} onRetry={() => refetch()} rows={rows} emptyMessage={EMPTY_MESSAGE} />
        {!isLoading &&
          !errorMessage &&
          rows.map((emp) => (
            <MobileCard key={emp.id} onOpen={() => navigate(String(emp.id))}>
              <div className="flex items-center gap-3">
                <Avatar name={emp.fullName} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{emp.fullName ?? '—'}</p>
                  <p className="truncate text-xs text-fg-muted">{emp.designation ?? '—'}</p>
                </div>
              </div>
              {emp.department?.name && (
                <div className="mt-3">
                  <Badge tone="neutral">{emp.department.name}</Badge>
                </div>
              )}
            </MobileCard>
          ))}
      </div>
    </>
  )
}
