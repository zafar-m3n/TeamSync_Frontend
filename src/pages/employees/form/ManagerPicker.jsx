import { useState } from 'react'
import Select from '@/components/ui/Select'
import { useEmployees } from '@/hooks/useEmployees'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

// Server-side employee search; `value` is the selected { value, label } option.
export default function ManagerPicker({ value, onChange, onBlur }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const { data } = useEmployees({
    page: 1,
    limit: 20,
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
  })
  const options = (data?.rows ?? []).map((e) => ({
    value: e.id,
    label: e.fullName,
  }))

  return (
    <Select
      isClearable
      options={options}
      placeholder="Search employees…"
      filterOption={() => true}
      onInputChange={(v) => setQuery(v)}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}
