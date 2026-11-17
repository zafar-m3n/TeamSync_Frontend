import { useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import FormField from '@/components/form/FormField'
import { useListFilters } from '@/hooks/useListFilters'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { useAllGoals } from '@/hooks/useAllGoals'
import { useAuth } from '@/store/useAuth'
import { canDeleteGoal } from '@/lib/permissions'
import DeleteGoalModal from '@/pages/goals/components/DeleteGoalModal'
import { goalColumns } from '@/pages/goals/utils/goalColumns'

const LIMIT = 10
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const YEAR_OPTIONS = [
  { value: '', label: 'Any year' },
  ...YEARS.map((y) => ({ value: String(y), label: String(y) })),
]
const MONTH_OPTIONS = [
  { value: '', label: 'Any month' },
  ...MONTHS.map((name, i) => ({ value: String(i + 1), label: name })),
]

// HR/Admin can't edit goals or record actuals; with goals.delete they can remove
// any goal (e.g. one left by a manager who has gone).
const columns = goalColumns({ withEmployee: true })

export default function AllGoalsPage() {
  const { filters, page, setFilter, setPage } = useListFilters({ employee: null, year: '', month: '' })
  const { employee, year, month } = filters
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { user, can } = useAuth()

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(employee ? { employeeId: employee.value } : {}),
      ...(year ? { year: Number(year) } : {}),
      // Month is only sent alongside a year — the backend ignores it otherwise.
      ...(year && month ? { month: Number(month) } : {}),
    }),
    [page, employee, year, month],
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useAllGoals(params)
  const rows = data?.rows ?? []

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Employee">
          <EmployeeSearchSelect value={employee} onChange={(opt) => setFilter('employee', opt ?? null)} placeholder="Any employee" />
        </FormField>
        <FormField label="Year">
          <Select
            options={YEAR_OPTIONS}
            value={YEAR_OPTIONS.find((o) => o.value === year) ?? null}
            onChange={(opt) => {
              setFilter('year', opt.value)
              if (!opt.value) setFilter('month', '')
            }}
          />
        </FormField>
        <FormField label="Month">
          <Select
            isDisabled={!year}
            options={MONTH_OPTIONS}
            value={MONTH_OPTIONS.find((o) => o.value === month) ?? null}
            onChange={(opt) => setFilter('month', opt.value)}
          />
        </FormField>
      </div>

      <Table
        caption="All goals"
        columns={columns}
        rows={rows}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load goals.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:target"
        emptyMessage="No goals match these filters"
        rowActions={
          can('goals', 'delete')
            ? (goal) =>
                canDeleteGoal(user, goal) && (
                  <IconButton icon="lucide:trash-2" label="Delete goal" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(goal)} />
                )
            : undefined
        }
      />

      {deleteTarget && (
        <DeleteGoalModal
          goal={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          // Step back when the last row on a later page goes.
          onDeleted={() => rows.length === 1 && page > 1 && setPage((p) => p - 1)}
        />
      )}
    </div>
  )
}
