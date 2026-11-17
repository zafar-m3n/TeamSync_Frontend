import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import { useMyGoals } from '@/hooks/useMyGoals'
import { goalColumns } from '@/pages/goals/utils/goalColumns'

const LIMIT = 10
const columns = goalColumns()

export default function MyGoalsPage() {
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({ page, limit: LIMIT }), [page])
  const { data, isLoading, isFetching, isError, error, refetch } = useMyGoals(params)

  return (
    <Table
      caption="My goals"
      columns={columns}
      rows={data?.rows ?? []}
      meta={data?.meta}
      onPageChange={setPage}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingRows={LIMIT}
      error={isError ? error?.message || 'Could not load your goals.' : null}
      onRetry={() => refetch()}
      emptyIcon="lucide:target"
      emptyMessage="No goals assigned to you yet"
    />
  )
}
