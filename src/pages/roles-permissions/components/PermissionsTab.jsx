import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'
import Spinner from '../../../components/ui/Spinner'
import Button from '../../../components/ui/Button'
import { useRoles } from '../../../hooks/useRoles'
import { usePermissions } from '../../../hooks/usePermissions'
import { useBulkUpdatePermissions } from '../../../hooks/useBulkUpdatePermissions'

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

  if (rolesQuery.isLoading || permsQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-accent" />
      </div>
    )
  }

  if (rolesQuery.isError || permsQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
        <p className="text-sm text-gray-600">Could not load the permission matrix.</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            rolesQuery.refetch()
            permsQuery.refetch()
          }}
        >
          Try again
        </Button>
      </div>
    )
  }

  const count = pending.size

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="accent"
          disabled={count === 0}
          isLoading={bulkUpdate.isPending}
          onClick={save}
        >
          {count === 0
            ? 'Save Changes'
            : `Save ${count} ${count === 1 ? 'Change' : 'Changes'}`}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 min-w-48 border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-text">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="whitespace-nowrap px-4 py-3 text-center font-medium text-text"
                >
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.module}>
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    className="bg-white px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {moduleLabel(group.module)}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    key={`${row.module}|${row.action}`}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="sticky left-0 z-10 min-w-48 bg-white px-4 py-2 text-text">
                      {actionLabel(row.action)}
                    </td>
                    {roles.map((role) => {
                      const entry = byKey.get(`${row.module}|${row.action}|${role.id}`)
                      const locked = entry != null && entry.id === lockedId
                      const cellPending = entry != null && pending.has(entry.id)
                      return (
                        <td key={role.id} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked(entry)}
                            disabled={entry == null || locked}
                            onChange={() => toggle(entry)}
                            title={locked ? LOCKOUT_TITLE : undefined}
                            className={clsx(
                              'h-4 w-4 rounded border-gray-300 accent-accent',
                              cellPending && 'ring-2 ring-accent ring-offset-1',
                              (entry == null || locked) && 'cursor-not-allowed opacity-60',
                            )}
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
    </div>
  )
}
