export type BudgetStatus = "ok" | "warning" | "exceeded" | "no_limit"

export type BudgetProgress = {
  limit: number | null
  spent: number
  remaining: number | null
  percentUsed: number | null
  status: BudgetStatus
}

export function computeBudgetProgress(
  limit: number | null,
  spent: number,
): BudgetProgress {
  if (limit === null || limit <= 0) {
    return {
      limit: null,
      spent,
      remaining: null,
      percentUsed: null,
      status: "no_limit",
    }
  }

  const remaining = Math.max(limit - spent, 0)
  const percentUsed = Math.round((spent / limit) * 1000) / 10

  let status: BudgetStatus = "ok"
  if (spent > limit) {
    status = "exceeded"
  } else if (percentUsed >= 80) {
    status = "warning"
  }

  return {
    limit,
    spent,
    remaining,
    percentUsed,
    status,
  }
}

export function getMonthDateRange(month: number, year: number) {
  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999)

  return { periodStart, periodEnd }
}
