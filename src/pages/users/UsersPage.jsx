import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Switch from '@/components/ui/Switch'
import IconButton from '@/components/ui/IconButton'
import FormField from '@/components/form/FormField'
import { useAuth } from '@/store/useAuth'
import { outranks } from '@/lib/permissions'
import { useRoles } from '@/hooks/useRoles'
import { useUsers } from '@/hooks/useUsers'
import { useUpdateUserStatus } from '@/hooks/useUpdateUserStatus'
import ResetPasswordModal from '@/pages/users/components/ResetPasswordModal'

const LIMIT = 10

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const columns = [
  {
    key: 'email',
    header: 'Email',
    render: (u) => (
      <span className="flex items-center gap-3">
        <Avatar name={u.email} />
        <span className="font-medium text-fg">{u.email}</span>
      </span>
    ),
  },
  { key: 'role', header: 'Role', render: (u) => (u.role?.name ? <Badge tone="neutral">{u.role.name}</Badge> : '—') },
  {
    key: 'status',
    header: 'Status',
    render: (u) => (
      <Badge dot tone={u.isActive ? 'success' : 'neutral'}>
        {u.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]

function LockChip({ title, children }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1 text-xs font-medium text-fg-muted"
      title={title}
    >
      <Icon icon="lucide:lock" width="12" height="12" aria-hidden />
      {children}
    </span>
  )
}

export default function UsersPage() {
  const { user, can } = useAuth()
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
      ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
    }),
    [page, roleId, status],
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers(params)
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  const rowActions = (row) => {
    const isSelf = String(row.id) === String(user.id)
    const canAct = outranks(user, row.role)
    const pendingThisRow = statusMutation.isPending && statusMutation.variables?.id === row.id
    return (
      <span className="flex items-center gap-3">
        {isSelf ? (
          <LockChip title="You can't deactivate your own account">Your account</LockChip>
        ) : !canAct ? (
          <LockChip title="Requires a higher role than this user's">Protected</LockChip>
        ) : (
          can('users', 'update_status') && (
            <Switch
              checked={row.isActive}
              disabled={pendingThisRow}
              title={pendingThisRow ? 'Updating…' : undefined}
              label={`${row.isActive ? 'Deactivate' : 'Activate'} ${row.email}`}
              onChange={(next) => statusMutation.mutate({ id: row.id, isActive: next })}
            />
          )
        )}
        {canAct && can('users', 'reset_password') && (
          <IconButton icon="lucide:key-round" label="Reset password" variant="ghost" size="sm" onClick={() => setResetTarget(row)} />
        )}
      </span>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <FormField label="Role">
            <Select
              isClearable
              options={roleOptions}
              placeholder="All roles"
              value={roleOptions.find((o) => o.value === roleId) ?? null}
              onChange={(opt) => {
                setRoleId(opt?.value ?? null)
                setPage(1)
              }}
            />
          </FormField>
        </div>
        <div className="w-full sm:w-40">
          <FormField label="Status">
            <Select
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find((o) => o.value === status) ?? null}
              onChange={(opt) => {
                setStatus(opt.value)
                setPage(1)
              }}
            />
          </FormField>
        </div>
      </div>

      <Table
        caption="Users"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load users.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:user-round-x"
        emptyMessage="No users found"
        rowActions={rowActions}
      />

      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  )
}
