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

export {
  getMonthDateRange,
  getCurrentMonthDateRange,
  getPreviousMonthDateRange,
} from "@/utils/timezone-date"
