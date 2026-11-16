import { activeBalances } from '@/pages/leave/utils/leaveBalances'

export default function LeaveBalanceSummary({ balances, year, isLoading }) {
  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading balances…</p>
  }

  const rows = activeBalances(balances)
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No leave balance set for {year}.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Leave type</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2 text-right">Used</th>
            <th className="px-4 py-2 text-right">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-text">
          {rows.map((b) => (
            <tr key={b.leaveTypeId}>
              <td className="px-4 py-2">{b.leaveTypeName}</td>
              <td className="px-4 py-2 text-right">{b.totalDays}</td>
              <td className="px-4 py-2 text-right">{b.usedDays}</td>
              <td className="px-4 py-2 text-right font-medium text-emerald-600">{b.remaining}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
