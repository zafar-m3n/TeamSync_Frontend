import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Icon } from '@iconify/react'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Checkbox from '@/components/ui/Checkbox'
import { useRoles } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import { useBulkUpdatePermissions } from '@/hooks/useBulkUpdatePermissions'

const ACTION_LABELS = {
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  view: 'View',
  view_own: 'View own',
  view_team: 'View team',
  view_all: 'View all',
  view_assigned: 'View assigned',
  view_own_uploads: 'View own uploads',
  manage: 'Manage',
  assign: 'Assign',
  override: 'Override',
  clock: 'Clock in/out',
  set_quota: 'Set quota',
  submit: 'Submit',
  approve: 'Approve',
  cancel_pending: 'Cancel pending',
  cancel_approved: 'Cancel approved',
  record_actual: 'Record actual',
  upload: 'Upload',
  remove_assignment: 'Remove assignment',
  reset_password: 'Reset password',
  update_status: 'Update status',
}

function humanize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

const actionLabel = (a) => ACTION_LABELS[a] ?? humanize(a)
const moduleLabel = (m) => humanize(m)

const MODULE_ICONS = {
  employees: 'lucide:users',
  users: 'lucide:user-cog',
  departments: 'lucide:building-2',
  shifts: 'lucide:clock',
  attendance: 'lucide:calendar-check',
  leave: 'lucide:calendar-days',
  leave_types: 'lucide:calendar-days',
  holidays: 'lucide:calendar-heart',
  goals: 'lucide:target',
  training: 'lucide:graduation-cap',
  training_categories: 'lucide:graduation-cap',
  roles: 'lucide:shield',
  permissions: 'lucide:shield',
}
const moduleIcon = (m) => MODULE_ICONS[m] ?? 'lucide:folder'

const LOCKOUT_TITLE =
  'The Admin role must keep permission management — removing it would lock everyone out of this screen.'

export default function PermissionsTab() {
  const rolesQuery = useRoles()
  const permsQuery = usePermissions()
  const bulkUpdate = useBulkUpdatePermissions()

  const roles = rolesQuery.data ?? []
  const permissions = permsQuery.data ?? []

  // Staged edits: permissionId -> new `allowed` value. Nothing is sent to the
  // server until Save Changes; a failed save must keep this map intact.
  const [pending, setPending] = useState(() => new Map())

  const { groups, byKey, lockedId } = useMemo(() => {
    const byKey = new Map()
    const seen = new Set()
    const ordered = []
    let lockedId = null
    for (const p of permissions) {
      byKey.set(`${p.module}|${p.action}|${p.role?.id}`, p)
      const rowKey = `${p.module}|${p.action}`
      if (!seen.has(rowKey)) {
        seen.add(rowKey)
        ordered.push({ module: p.module, action: p.action })
      }
      if (
        p.role?.name === 'Admin' &&
        p.module === 'permissions' &&
        p.action === 'manage'
      ) {
        lockedId = p.id
      }
    }
    const groups = []
    for (const row of ordered) {
      let last = groups[groups.length - 1]
      if (!last || last.module !== row.module) {
        last = { module: row.module, rows: [] }
        groups.push(last)
      }
      last.rows.push(row)
    }
    return { groups, byKey, lockedId }
  }, [permissions])

  const isChecked = (entry) => {
    if (!entry) return false
    return pending.has(entry.id) ? pending.get(entry.id) : entry.allowed
  }

  const toggle = (entry) => {
    if (!entry || entry.id === lockedId) return
    setPending((prev) => {
      const next = new Map(prev)
      const current = next.has(entry.id) ? next.get(entry.id) : entry.allowed
      const newValue = !current
      if (newValue === entry.allowed) next.delete(entry.id)
      else next.set(entry.id, newValue)
      return next
    })
  }

  const save = () => {
    const updates = [...pending.entries()].map(([id, allowed]) => ({ id, allowed }))
    if (updates.length === 0) return
    bulkUpdate.mutate(updates, {
      onSuccess: () => setPending(new Map()),
    })
  }

  const discard = () => setPending(new Map())

  if (rolesQuery.isLoading || permsQuery.isLoading) {
    return (
      <LoadingRegion label="Loading permissions" className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-surface-subtle px-4 py-3">
          <Skeleton className="h-3 w-64" />
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-8 border-b border-line px-4 py-3 last:border-0">
            <Skeleton className="h-3 w-32" />
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="h-4 w-4" />
            ))}
          </div>
        ))}
      </LoadingRegion>
    )
  }

  if (rolesQuery.isError || permsQuery.isError) {
    return (
      <Card>
        <ErrorState
          message="Could not load the permission matrix."
          onRetry={() => {
            rolesQuery.refetch()
            permsQuery.refetch()
          }}
        />
      </Card>
    )
  }

  const count = pending.size

  return (
    <div className="space-y-4">
      <p className="text-cell text-fg-muted">
        Tick what each role can do, then save. Changes are staged until you save them.
      </p>
      <div className="relative max-h-[calc(100vh-15rem)] overflow-auto rounded-lg border border-line bg-surface shadow-sm">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Permissions by role</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 top-0 z-30 min-w-52 border-b border-r border-line bg-surface-subtle px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted"
              >
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  scope="col"
                  className="sticky top-0 z-20 whitespace-nowrap border-b border-line bg-surface-subtle px-4 py-3 text-center text-xs font-semibold text-fg"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {role.name}
                    {role.isCustom && <Badge tone="info">Custom</Badge>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.module}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={roles.length + 1}
                    className="border-b border-line bg-surface px-0 pb-2 pt-5 text-left"
                  >
                    <span className="sticky left-0 inline-flex items-center gap-2 px-4 text-sm font-semibold text-fg">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <Icon icon={moduleIcon(group.module)} width="14" height="14" aria-hidden />
                      </span>
                      {moduleLabel(group.module)}
                      <span className="text-xs font-normal text-fg-subtle">{group.rows.length}</span>
                    </span>
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={`${row.module}|${row.action}`} className="group">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 min-w-52 border-b border-r border-line bg-surface px-4 py-1.5 text-left font-normal text-fg transition-colors duration-(--duration-fast) group-hover:bg-surface-subtle"
                    >
                      {actionLabel(row.action)}
                    </th>
                    {roles.map((role) => {
                      const entry = byKey.get(`${row.module}|${row.action}|${role.id}`)
                      const locked = entry != null && entry.id === lockedId
                      const cellPending = entry != null && pending.has(entry.id)
                      return (
                        <td
                          key={role.id}
                          className={clsx(
                            'border-b border-line px-4 py-1.5 text-center transition-colors duration-(--duration-fast) group-hover:bg-surface-subtle',
                            cellPending && 'bg-warning-soft/50',
                          )}
                        >
                          <Checkbox
                            checked={isChecked(entry)}
                            disabled={entry == null}
                            locked={locked}
                            pending={cellPending}
                            onChange={() => toggle(entry)}
                            title={locked ? LOCKOUT_TITLE : undefined}
                            aria-label={`${role.name}: ${moduleLabel(row.module)} ${actionLabel(row.action)}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={clsx(
          'flex items-center justify-end gap-2',
          count > 0 && 'sticky bottom-0 z-20 -mx-1 rounded-lg border border-line bg-surface/95 px-4 py-3 shadow-md backdrop-blur-sm',
        )}
      >
        {count > 0 && (
          <p className="mr-auto flex items-center gap-2 text-sm text-fg-muted" role="status">
            <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
            {count} unsaved {count === 1 ? 'change' : 'changes'}
          </p>
        )}
        <Button variant="secondary" disabled={count === 0} onClick={discard}>
          Discard
        </Button>
        <Button variant="primary" disabled={count === 0} isLoading={bulkUpdate.isPending} onClick={save}>
          {count === 0 ? 'Save Changes' : `Save ${count} ${count === 1 ? 'Change' : 'Changes'}`}
        </Button>
      </div>
    </div>
  )
}
