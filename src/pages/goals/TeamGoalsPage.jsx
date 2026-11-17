import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useTeamGoals } from '@/hooks/useTeamGoals'
import { useAuth } from '@/store/useAuth'
import { canDeleteGoal } from '@/lib/permissions'
import GoalFormModal from '@/pages/goals/components/GoalFormModal'
import RecordActualModal from '@/pages/goals/components/RecordActualModal'
import DeleteGoalModal from '@/pages/goals/components/DeleteGoalModal'
import { goalColumns } from '@/pages/goals/utils/goalColumns'

const LIMIT = 10
const columns = goalColumns({ withEmployee: true })

export default function TeamGoalsPage() {
  const [page, setPage] = useState(1)
  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [actualTarget, setActualTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { user } = useAuth()

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isFetching, isError, error, refetch } = useTeamGoals(params)
  const rows = data?.rows ?? []

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Goal
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{newButton()}</div>

      <Table
        caption="Team goals"
        columns={columns}
        rows={rows}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load your team goals.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:target"
        emptyMessage="No goals set for your team yet"
        emptyAction={newButton('sm')}
        rowActions={(goal) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit goal" variant="ghost" size="sm" onClick={() => setFormTarget(goal)} />
            <IconButton
              icon="lucide:clipboard-check"
              label="Record actual"
              variant="ghost"
              size="sm"
              onClick={() => setActualTarget(goal)}
            />
            {canDeleteGoal(user, goal) && (
              <IconButton icon="lucide:trash-2" label="Delete goal" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(goal)} />
            )}
          </>
        )}
      />

      {formTarget !== undefined && (
        <GoalFormModal key={formTarget?.id ?? 'new'} goal={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      {actualTarget && <RecordActualModal goal={actualTarget} onClose={() => setActualTarget(null)} />}

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
