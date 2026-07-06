import { Goal, Expense, Receipt, FinancialHealth, CategoryExpense } from "@/src/types"
import { calculatePercentage, getDaysRemaining } from "@/src/lib/utils"

export function getCategoryExpenses(expenses: Expense[]): CategoryExpense[] {
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.value
      return acc
    },
    {} as Record<string, number>,
  )

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)

  return Object.entries(categoryTotals).map(([category, value]) => ({
    category,
    value,
    percentage: calculatePercentage(value, total),
  }))
}

export function getTotalExpenses(expenses: Expense[]) {
  const fixed = expenses
    .filter((e) => e.type === "fixo")
    .reduce((sum, e) => sum + e.value, 0)
  const variable = expenses
    .filter((e) => e.type === "variavel")
    .reduce((sum, e) => sum + e.value, 0)
  return { fixed, variable, total: fixed + variable }
}

export function getTotalReceipts(receipts: Receipt[]) {
  return receipts.reduce((sum, receipt) => sum + receipt.value, 0)
}

export function getFinancialHealth(
  goals: Goal[],
  expenses: Expense[],
  receipts: Receipt[],
): FinancialHealth {
  const totalExpenses = getTotalExpenses(expenses).total
  const totalReceipts = getTotalReceipts(receipts)
  const expenseRatio = totalReceipts > 0 ? (totalExpenses / totalReceipts) * 100 : 0

  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentValue, 0)
  const savingsRate = totalReceipts > 0 ? (totalSavings / totalReceipts) * 100 : 0

  const goalsOnTrack = goals.filter((goal) => {
    const progress = calculatePercentage(goal.currentValue, goal.totalValue)
    const daysRemaining = getDaysRemaining(goal.deadlineDate)
    const totalDays = getDaysRemaining(goal.deadlineDate) + 365
    const expectedProgress = calculatePercentage(365, totalDays)
    return progress >= expectedProgress * 0.8
  }).length

  const goalsOnTrackPercentage = goals.length > 0 ? (goalsOnTrack / goals.length) * 100 : 0

  let score = 0
  score += (100 - expenseRatio) * 0.4
  score += savingsRate * 0.3
  score += goalsOnTrackPercentage * 0.3

  let status: FinancialHealth["status"] = "critico"
  if (score >= 80) status = "excelente"
  else if (score >= 60) status = "bom"
  else if (score >= 40) status = "atencao"

  return {
    score: Math.round(score),
    status,
    factors: {
      expenseRatio,
      savingsRate,
      goalsOnTrack: goalsOnTrackPercentage,
    },
  }
}
