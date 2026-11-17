import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { DateRangeField } from '@/components/form/DatePicker'

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => ({
  value: s,
  label: s,
}))

// filters: { status, employee, range }; onChange(key, value).
export default function LeaveRequestFilters({ filters, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <FormField label="Employee">
        <EmployeeSearchSelect
          value={filters.employee}
          onChange={(opt) => onChange('employee', opt ?? null)}
          placeholder="Any employee"
        />
      </FormField>
      <FormField label="Status">
        <Select
          isClearable
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(opt) => onChange('status', opt ?? null)}
          placeholder="Any status"
        />
      </FormField>
      <FormField label="Start date range">
        <DateRangeField value={filters.range} onChange={(range) => onChange('range', range)} placeholder="Any dates" />
      </FormField>
    </div>
  )
}
