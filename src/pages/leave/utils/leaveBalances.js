// The balance API returns one entry per leave type; these read that list.
export const findBalance = (balances, leaveTypeId) =>
  balances?.find((b) => b.leaveTypeId === leaveTypeId) ?? null

export const sumBalances = (balances) =>
  (balances ?? []).reduce(
    (sum, b) => ({
      totalDays: sum.totalDays + b.totalDays,
      usedDays: sum.usedDays + b.usedDays,
      remaining: sum.remaining + b.remaining,
    }),
    { totalDays: 0, usedDays: 0, remaining: 0 },
  )

// Types that have a quota or usage; the rest are noise in a summary.
export const activeBalances = (balances) =>
  (balances ?? []).filter((b) => b.totalDays > 0 || b.usedDays > 0)
