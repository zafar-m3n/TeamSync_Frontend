import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmploymentStatusBadge from '@/pages/employees/components/EmploymentStatusBadge'
import { Avatar, NameCell, RowActions } from '@/pages/employees/list/EmployeeListParts'
import { allColumns } from '@/pages/employees/list/employeeListConfig'

const EMPTY_MESSAGE = 'No employees yet — add your first employee'

// Table on desktop, cards on mobile. deleteHandlerFor(emp) returns a handler or null.
export default function EmployeeTable({ rows, navigate, deleteHandlerFor }) {
  const newButton = (
    <Button variant="accent" size="sm" onClick={() => navigate('new')}>
      New Employee
    </Button>
  )

  return (
    <>
      <div className="hidden md:block">
        <Table
          columns={allColumns}
          rows={rows}
          emptyMessage={EMPTY_MESSAGE}
          emptyAction={newButton}
          renderRow={(emp) => (
            <tr
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">
                <NameCell name={emp.fullName} />
              </td>
              <td className="px-4 py-3 text-text">{emp.employeeCode ?? '—'}</td>
              <td className="px-4 py-3 text-text">
                {emp.department?.name ? (
                  <Badge tone="neutral">{emp.department.name}</Badge>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
              <td className="px-4 py-3">
                <EmploymentStatusBadge status={emp.employmentStatus} />
              </td>
              <td className="px-4 py-3 text-text">
                {emp.shift?.name ? <Badge tone="neutral">{emp.shift.name}</Badge> : '—'}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  empId={emp.id}
                  navigate={navigate}
                  className="justify-end"
                  onDelete={deleteHandlerFor(emp)}
                />
              </td>
            </tr>
          )}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">
              {EMPTY_MESSAGE}
            </p>
            <div className="mt-4 flex justify-center">
              {newButton}
            </div>
          </div>
        ) : (
          rows.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={emp.fullName} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text">
                      {emp.fullName ?? '—'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {emp.employeeCode ?? '—'}
                    </p>
                  </div>
                </div>
                <RowActions
                  empId={emp.id}
                  navigate={navigate}
                  onDelete={deleteHandlerFor(emp)}
                />
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-text">{emp.designation ?? '—'}</p>
                {(emp.employmentStatus || emp.department?.name || emp.shift?.name) && (
                  <div className="flex flex-wrap gap-2">
                    <EmploymentStatusBadge status={emp.employmentStatus} />
                    {emp.department?.name && (
                      <Badge tone="neutral">{emp.department.name}</Badge>
                    )}
                    {emp.shift?.name && <Badge tone="neutral">{emp.shift.name}</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
