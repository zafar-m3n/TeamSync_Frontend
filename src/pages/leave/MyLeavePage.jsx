import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import StatCard from '@/components/ui/StatCard'
import FormField from '@/components/form/FormField'
import { CountUp } from '@/hooks/useMotion'
import { useAuth } from '@/store/useAuth'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useListFilters } from '@/hooks/useListFilters'
import { useLeaveBalance } from '@/hooks/useLeaveBalance'
import { useMyLeaveRequests } from '@/hooks/useMyLeaveRequests'
import { canCancelLeaveRequest } from '@/pages/leave/utils/canCancelLeaveRequest'
import LeaveStatusBadge from '@/pages/leave/components/LeaveStatusBadge'
import LeaveRequestFormModal from '@/pages/leave/components/LeaveRequestFormModal'
import LeaveBalanceSummary from '@/pages/leave/components/LeaveBalanceSummary'
import { CancelLeaveModal } from '@/pages/leave/components/LeaveDecisionModals'
import { sumBalances } from '@/pages/leave/utils/leaveBalances'
import HolidayList from '@/pages/holidays/components/HolidayList'
import { datesLabel } from '@/pages/leave/utils/leaveDates'
import { LIMIT } from '@/pages/leave/utils/leaveRequestList'

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]
const YEAR_OPTIONS = YEARS.map((y) => ({ value: y, label: String(y) }))
const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...STATUSES.map((s) => ({ value: s, label: s }))]

const columns = [
  { key: 'leaveType', header: 'Leave Type', className: 'font-medium', render: (r) => r.leaveType?.name ?? '—' },
  { key: 'dates', header: 'Dates', className: 'whitespace-nowrap tabular-nums', render: datesLabel },
  { key: 'days', header: 'Days', align: 'right', className: 'tabular-nums' },
  { key: 'status', header: 'Status', render: (r) => <LeaveStatusBadge status={r.status} /> },
]

export default function MyLeavePage() {
  const { user, can } = useAuth()
  const canRequestLeave = can('leave', 'submit') && can('leave_types', 'view')
  const canViewHolidays = can('holidays', 'view')
  const { data: profile, isError: profileError, error: profileErr, refetch: refetchProfile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  const [year, setYear] = useState(CURRENT_YEAR)
  // The year only drives the balance cards; the status filter pages the request list.
  const { filters, page, setFilter, setPage } = useListFilters({ status: 'all' })
  const { status } = filters
  const [showForm, setShowForm] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const {
    data: balances,
    isLoading: balancesLoading,
    isError: balancesError,
    error: balancesErr,
    refetch: refetchBalances,
  } = useLeaveBalance(currentEmployeeId, year)
  const balance = balances ? sumBalances(balances) : null

  const params = useMemo(() => ({ page, limit: LIMIT, ...(status !== 'all' ? { status } : {}) }), [page, status])
  const { data, isLoading, isFetching, isError, error, refetch } = useMyLeaveRequests(params)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <FormField label="Year">
            <Select
              options={YEAR_OPTIONS}
              value={YEAR_OPTIONS.find((o) => o.value === year) ?? null}
              onChange={(opt) => setYear(opt.value)}
            />
          </FormField>
        </div>
        {canRequestLeave && (
          <Button variant="primary" className="ml-auto" onClick={() => setShowForm(true)}>
            <Icon icon="lucide:plus" width="16" height="16" aria-hidden />
            Request Leave
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={<CountUp value={balance?.remaining ?? '—'} />} label="Remaining" tone="success" icon="lucide:calendar-check" />
        <StatCard value={<CountUp value={balance?.usedDays ?? '—'} />} label="Used" icon="lucide:calendar-minus" />
        <StatCard value={<CountUp value={balance?.totalDays ?? '—'} />} label="Total" icon="lucide:calendar-days" />
      </div>

      <div className={clsx('grid items-start gap-6', canViewHolidays && 'lg:grid-cols-3')}>
        <div className={clsx(canViewHolidays && 'lg:col-span-2')}>
          <LeaveBalanceSummary
            balances={balances}
            year={year}
            isLoading={currentEmployeeId != null && balancesLoading}
            error={profileError ? profileErr : balancesError ? balancesErr : null}
            onRetry={() => (profileError ? refetchProfile() : refetchBalances())}
          />
        </div>
        {canViewHolidays && <HolidayList year={year} />}
      </div>

      <section className="space-y-4">
        <div className="w-40">
          <FormField label="Status">
            <Select
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find((o) => o.value === status) ?? null}
              onChange={(opt) => setFilter('status', opt.value)}
            />
          </FormField>
        </div>

        <Table
          caption="My leave requests"
          columns={columns}
          rows={data?.rows ?? []}
          meta={data?.meta}
          onPageChange={setPage}
          isLoading={isLoading}
          isFetching={isFetching}
          loadingRows={LIMIT}
          error={isError ? error : null}
          onRetry={() => refetch()}
          emptyIcon="lucide:calendar-x"
          emptyMessage="No leave requests yet"
          rowActions={(req) =>
            canCancelLeaveRequest({ request: req, currentUser: user, currentEmployeeId }) && (
              <IconButton icon="lucide:ban" label="Cancel request" variant="ghost-danger" size="sm" onClick={() => setCancelTarget(req)} />
            )
          }
        />
      </section>

      {showForm && <LeaveRequestFormModal onClose={() => setShowForm(false)} />}

      <CancelLeaveModal request={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  )
}
