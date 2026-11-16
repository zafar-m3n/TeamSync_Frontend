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
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-1 flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <Input
          type="search"
          placeholder="Search employees…"
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-56">
          <Select
            options={departmentOptions}
            value={departmentOptions.find((o) => o.value === filters.departmentId) ?? null}
            onChange={(opt) => filters.setDepartmentId(opt.value)}
          />
        </div>
        <div className="w-56">
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={STATUS_FILTER_OPTIONS.find((o) => o.value === filters.statusFilter) ?? null}
            onChange={(opt) => filters.setStatusFilter(opt.value)}
          />
        </div>
      </div>
      <Button variant="accent" onClick={onNew}>
        New Employee
      </Button>
    </div>
  )
}
