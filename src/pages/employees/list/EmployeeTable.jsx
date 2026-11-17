import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Pagination from '@/components/ui/Pagination'
import EmploymentStatusBadge from '@/pages/employees/components/EmploymentStatusBadge'
import { MobileCard, MobileListState, NameCell, RowActions } from '@/pages/employees/list/EmployeeListParts'
import { LIMIT, allColumns } from '@/pages/employees/list/employeeListConfig'

const EMPTY_MESSAGE = 'No employees yet — add your first employee'

// Table on desktop, cards on mobile. deleteHandlerFor(emp) returns a handler or null.
export default function EmployeeTable({ rows, meta, onPageChange, isLoading, isFetching, error, onRetry, navigate, deleteHandlerFor }) {
  const newButton = (
    <Button variant="primary" size="sm" onClick={() => navigate('new')}>
      <Icon icon="lucide:plus" width="14" height="14" aria-hidden />
      New Employee
    </Button>
  )

  return (
    <>
      <div className="hidden md:block">
        <Table
          caption="Employees"
          columns={allColumns}
          rows={rows}
          isLoading={isLoading}
          isFetching={isFetching}
          loadingRows={LIMIT}
          error={error}
          onRetry={onRetry}
          meta={meta}
          onPageChange={onPageChange}
          emptyMessage={EMPTY_MESSAGE}
          emptyIcon="lucide:users"
          emptyAction={newButton}
          renderRow={(emp) => (
            <tr
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer border-b border-line transition-colors duration-(--duration-fast) last:border-0 hover:bg-surface-subtle"
            >
              <td className="px-4 py-2.5">
                <NameCell name={emp.fullName} />
              </td>
              <td className="px-4 py-2.5 tabular-nums text-fg-muted">{emp.employeeCode ?? '—'}</td>
              <td className="px-4 py-2.5 text-fg">
                {emp.department?.name ? <Badge tone="neutral">{emp.department.name}</Badge> : <span className="text-fg-subtle">—</span>}
              </td>
              <td className="px-4 py-2.5 text-fg">{emp.designation ?? '—'}</td>
              <td className="px-4 py-2.5">
                <EmploymentStatusBadge status={emp.employmentStatus} />
              </td>
              <td className="px-4 py-2.5 text-fg">
                {emp.shift?.name ? <Badge tone="neutral">{emp.shift.name}</Badge> : <span className="text-fg-subtle">—</span>}
              </td>
              <td className="px-4 py-2">
                <RowActions empId={emp.id} navigate={navigate} className="justify-end" onDelete={deleteHandlerFor(emp)} />
              </td>
            </tr>
          )}
        />
      </div>

      <div className="space-y-3 md:hidden">
        <MobileListState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          rows={rows}
          emptyMessage={EMPTY_MESSAGE}
          emptyAction={newButton}
        />
        {!isLoading &&
          !error &&
          rows.map((emp) => (
            <MobileCard key={emp.id} onOpen={() => navigate(String(emp.id))}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={emp.fullName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{emp.fullName ?? '—'}</p>
                    <p className="truncate text-xs text-fg-muted">{emp.employeeCode ?? '—'}</p>
                  </div>
                </div>
                <RowActions empId={emp.id} navigate={navigate} onDelete={deleteHandlerFor(emp)} />
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-fg">{emp.designation ?? '—'}</p>
                {(emp.employmentStatus || emp.department?.name || emp.shift?.name) && (
                  <div className="flex flex-wrap gap-2">
                    <EmploymentStatusBadge status={emp.employmentStatus} />
                    {emp.department?.name && <Badge tone="neutral">{emp.department.name}</Badge>}
                    {emp.shift?.name && <Badge tone="neutral">{emp.shift.name}</Badge>}
                  </div>
                )}
              </div>
            </MobileCard>
          ))}
        {!isLoading && !error && rows.length > 0 && meta && <Pagination meta={meta} onPageChange={onPageChange} />}
      </div>
    </>
  )
}
