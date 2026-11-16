import Select from '@/components/ui/Select'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { useDepartments } from '@/hooks/useDepartments'
import { useAllTrainingDocuments } from '@/hooks/useAllTrainingDocuments'

// filters: { document, employee, dept } as { value, label } options or null.
export default function AssignmentFilters({ filters, onChange }) {
  const { data: docData } = useAllTrainingDocuments({ page: 1, limit: 200 })
  const documentOptions = (docData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.title,
  }))

  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departmentOptions = (deptData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Document</label>
        <Select
          isClearable
          options={documentOptions}
          value={filters.document}
          onChange={(opt) => onChange('document', opt ?? null)}
          placeholder="Any document"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Employee</label>
        <EmployeeSearchSelect
          value={filters.employee}
          onChange={(opt) => onChange('employee', opt ?? null)}
          placeholder="Any employee"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
        <Select
          isClearable
          options={departmentOptions}
          value={filters.dept}
          onChange={(opt) => onChange('dept', opt ?? null)}
          placeholder="Any department"
        />
      </div>
    </div>
  )
}
