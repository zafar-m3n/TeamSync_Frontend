import { Icon } from '@iconify/react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Input from '@/components/form/Input'
import { useDepartments } from '@/hooks/useDepartments'
import { EMPLOYMENT_STATUSES } from '@/pages/employees/utils/employmentStatus'

// 'current' (the backend default) hides people whose leaving date has passed.
const STATUS_FILTER_OPTIONS = [
  { value: 'current', label: 'Current employees' },
  { value: 'former', label: 'Former employees' },
  { value: 'all', label: 'All employees' },
  ...EMPLOYMENT_STATUSES.map((s) => ({ value: s, label: s })),
]

export default function EmployeeFilters({ filters, onNew }) {
  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departmentOptions = [
    { value: '', label: 'All departments' },
    ...(deptData?.rows ?? []).map((d) => ({ value: String(d.id), label: d.name })),
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Icon
          icon="lucide:search"
          width="16"
          height="16"
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
        <Input
          type="search"
          aria-label="Search employees"
          placeholder="Search employees…"
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-52">
        <Select
          aria-label="Department"
          options={departmentOptions}
          value={departmentOptions.find((o) => o.value === filters.departmentId) ?? null}
          onChange={(opt) => filters.setDepartmentId(opt.value)}
        />
      </div>
      <div className="w-full sm:w-52">
        <Select
          aria-label="Employment status"
          options={STATUS_FILTER_OPTIONS}
          value={STATUS_FILTER_OPTIONS.find((o) => o.value === filters.statusFilter) ?? null}
          onChange={(opt) => filters.setStatusFilter(opt.value)}
        />
      </div>
      <Button variant="primary" onClick={onNew} className="sm:ml-auto">
        <Icon icon="lucide:plus" width="16" height="16" aria-hidden />
        New Employee
      </Button>
    </div>
  )
}
