import { useMemo, useState } from 'react'
import Select from 'react-select'
import clsx from 'clsx'
import Table from '../../components/ui/Table'
import TableSkeleton from '../../components/ui/TableSkeleton'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../store/AuthContext'
import { useRoles } from '../../hooks/useRoles'
import { useUsers } from '../../hooks/useUsers'
import { useUpdateUserStatus } from '../../hooks/useUpdateUserStatus'
import ResetPasswordModal from './components/ResetPasswordModal'

const LIMIT = 10

const columns = [
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'actions', header: 'Actions' },
]

const selectClassNames = {
  control: ({ isFocused }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
      isFocused ? 'border-accent ring-2 ring-accent' : 'border-gray-300',
    ),
  valueContainer: () => 'px-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  dropdownIndicator: () => 'px-1.5 text-gray-400',
  clearIndicator: () => 'px-1.5 text-gray-400 hover:text-text',
  indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
  menu: () => 'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
  menuList: () => 'py-1',
  option: ({ isFocused, isSelected }) =>
    clsx(
      'cursor-pointer px-3 py-2 text-sm',
      isSelected
        ? 'bg-accent text-white'
        : isFocused
          ? 'bg-gray-100 text-text'
          : 'text-text',
    ),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-gray-400',
}

// Switch-style toggle. Small and generic — could move to components/ui/ later.
function StatusToggle({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      title={disabled ? "You can't deactivate your own account" : undefined}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        checked ? 'bg-emerald-500' : 'bg-gray-300',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default function UsersPage() {
  const { user } = useAuth()
  const { data: roles = [] } = useRoles()
  const statusMutation = useUpdateUserStatus()

  const [page, setPage] = useState(1)
  const [roleId, setRoleId] = useState(null)
  const [status, setStatus] = useState('all') // all | active | inactive
  const [resetTarget, setResetTarget] = useState(null)

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(roleId ? { roleId } : {}),
      ...(status === 'active'
        ? { isActive: true }
        : status === 'inactive'
          ? { isActive: false }
          : {}),
    }),
    [page, roleId, status],
  )

  const { data, isLoading, isError, error, refetch } = useUsers(params)
  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-56">
          <label className="mb-1 block text-xs font-medium text-gray-500">Role</label>
          <Select
            unstyled
            isClearable
            classNames={selectClassNames}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
            options={roleOptions}
            placeholder="All roles"
            value={roleOptions.find((o) => o.value === roleId) ?? null}
            onChange={(opt) => {
              setRoleId(opt?.value ?? null)
              setPage(1)
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">{error?.message || 'Could not load users.'}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage="No users found"
            renderRow={(row) => {
              const isSelf = String(row.id) === String(user.id)
              const pendingThisRow =
                statusMutation.isPending && statusMutation.variables?.id === row.id
              return (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-text">{row.email}</td>
                  <td className="px-4 py-3 text-text">{row.role?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={row.isActive ? 'success' : 'neutral'}>
                      {row.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <StatusToggle
                          checked={row.isActive}
                          disabled={isSelf || pendingThisRow}
                          label={`${row.isActive ? 'Deactivate' : 'Activate'} ${row.email}`}
                          onChange={(next) =>
                            statusMutation.mutate({ id: row.id, isActive: next })
                          }
                        />
                        {isSelf && (
                          <span className="text-xs text-gray-400">
                            You can&rsquo;t deactivate your own account
                          </span>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setResetTarget(row)}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            }}
          />

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {meta.page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  )
}
