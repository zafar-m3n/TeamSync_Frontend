import { useState } from 'react'
import Select from '@/components/ui/Select'
import { useEmployees } from '@/hooks/useEmployees'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatEmployeeOption, toEmployeeOption } from '@/components/form/employeeOption'

// Clearable employee picker with server-side search; `value` is a { value, label, role? } option.
// Each option shows the employee's role next to their name.
export default function EmployeeSearchSelect({ value, onChange, onBlur, placeholder }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const { data } = useEmployees({
    page: 1,
    limit: 20,
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
  })
  const options = (data?.rows ?? []).map(toEmployeeOption)

  return (
    <Select
      isClearable
      options={options}
      filterOption={() => true}
      formatOptionLabel={formatEmployeeOption}
      onInputChange={(v) => setQuery(v)}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  )
}
