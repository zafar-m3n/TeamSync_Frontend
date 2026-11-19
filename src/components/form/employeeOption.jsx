// Employee pickers show the person's role next to their name, so people with
// similar names (or a manager vs. an employee) are easy to tell apart.

/** Employee list row -> Select option. `role` is omitted when the API didn't include it. */
export function toEmployeeOption(employee) {
  return {
    value: employee.id,
    label: employee.fullName,
    role: employee.user?.role?.name ?? null,
  }
}

/** react-select `formatOptionLabel`: name, then the role in muted text. */
export function formatEmployeeOption(option) {
  return (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="truncate">{option.label}</span>
      {option.role && <span className="shrink-0 text-xs font-normal text-fg-muted">{option.role}</span>}
    </span>
  )
}
