import { useState } from 'react'
import Table from '@/components/ui/Table'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useUsers } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { toast } from '@/hooks/useToast'

const FORCE = ['live', 'loading', 'empty', 'error']

const userColumns = [
  { key: 'email', header: 'Email', className: 'font-medium' },
  { key: 'role', header: 'Role', render: (u) => u.role?.name ?? '—' },
  {
    key: 'isActive',
    header: 'Status',
    render: (u) => (
      <Badge dot tone={u.isActive ? 'success' : 'neutral'}>
        {u.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]

const roleColumns = [
  { key: 'name', header: 'Role', sortable: true, className: 'font-medium' },
  { key: 'description', header: 'Description', sortable: true, render: (r) => r.description || '—' },
  {
    key: 'isCustom',
    header: 'Type',
    sortable: true,
    sortValue: (r) => (r.isCustom ? 1 : 0),
    render: (r) => <Badge tone={r.isCustom ? 'info' : 'neutral'}>{r.isCustom ? 'Custom' : 'System'}</Badge>,
  },
]

const demoAction = (what) => () => toast.info(`${what} (demo only, nothing changes).`)

export default function DataDisplaySection() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(2)
  const [force, setForce] = useState('live')
  const users = useUsers({ page, limit })
  const roles = useRoles()

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Table: real Users API, paginated from meta"
        description="Read-only demo: row actions only raise a toast. Force a state to preview it."
        actions={
          <div role="group" aria-label="Preview state" className="flex rounded-md border border-line p-0.5">
            {FORCE.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={force === f}
                onClick={() => setForce(f)}
                className={
                  force === f
                    ? 'rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700'
                    : 'rounded px-2 py-1 text-xs text-fg-muted hover:text-fg'
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <Table
          caption="Users"
          columns={userColumns}
          rows={force === 'empty' ? [] : (users.data?.rows ?? [])}
          isLoading={force === 'loading' || (force === 'live' && users.isLoading)}
          isFetching={users.isFetching}
          error={force === 'error' || (force === 'live' && users.isError) ? 'The users list could not be loaded.' : undefined}
          onRetry={() => {
            setForce('live')
            users.refetch()
          }}
          emptyTitle="No users found"
          emptyMessage="Try a different role or status filter."
          emptyIcon="lucide:user-search"
          rowActions={(u) => (
            <>
              <IconButton icon="lucide:key-round" label={`Reset password for ${u.email}`} onClick={demoAction('Reset password')} />
              <IconButton icon="lucide:user-x" variant="danger" label={`Deactivate ${u.email}`} onClick={demoAction('Deactivate')} />
            </>
          )}
          meta={users.data?.meta}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setLimit(n)
            setPage(1)
          }}
          pageSizeOptions={[1, 2, 5, 10]}
        />
      </Card>

      <Card title="Table: real Roles list, sorted in the browser" description="Click a header: ascending → descending → off.">
        <Table
          caption="Roles"
          columns={roleColumns}
          rows={roles.data ?? []}
          isLoading={roles.isLoading}
          error={roles.isError ? 'Roles could not be loaded.' : undefined}
          onRetry={roles.refetch}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Badges">
          <div className="flex flex-wrap gap-2">
            {['neutral', 'brand', 'success', 'warning', 'danger', 'info'].map((t) => (
              <Badge key={t} tone={t}>
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge dot tone="success">
              Active
            </Badge>
            <Badge dot tone="warning">
              Pending
            </Badge>
            <Badge dot tone="danger">
              Terminated
            </Badge>
            <Badge size="sm" tone="info">
              Custom
            </Badge>
          </div>
        </Card>

        <Card title="Skeleton">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <SkeletonText lines={2} />
            </div>
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
        </Card>

        <Card title="Card with actions" description="Header, description and actions slot." actions={<Button size="sm" variant="secondary">Action</Button>}>
          <p className="text-sm text-fg-muted">Body content sits on the surface token with a 1px line border and the sm shadow.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="none">
          <EmptyState
            icon="lucide:calendar-x"
            title="No leave requests"
            message="When your team requests leave, it shows up here."
            action={<Button size="sm">Request leave</Button>}
          />
        </Card>
        <Card padding="none">
          <ErrorState onRetry={demoAction('Retry')} />
        </Card>
        <Card padding="none">
          <ErrorState kind="forbidden" />
        </Card>
      </div>
    </div>
  )
}
