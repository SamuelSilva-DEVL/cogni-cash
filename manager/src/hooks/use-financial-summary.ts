import { useMemo } from "react"
import { useGoals } from "@/src/hooks/use-goals"
import { useExpenses, useReceipts } from "@/src/hooks/use-transactions"
import {
  getCategoryExpenses,
  getFinancialHealth,
  getTotalExpenses,
  getTotalReceipts,
} from "@/src/lib/financial-calculations"

export function useFinancialSummary() {
  const goalsQuery = useGoals()
  const expensesQuery = useExpenses()
  const receiptsQuery = useReceipts()

  const summary = useMemo(() => {
    const goalsData = goalsQuery.data ?? []
    const expensesData = expensesQuery.data?.expenses ?? []
    const receiptsData = receiptsQuery.data?.receipts ?? []

    return {
      goals: goalsData,
      expenses: expensesData,
      receipts: receiptsData,
      categoryExpenses: getCategoryExpenses(expensesData),
      totalExpenses: getTotalExpenses(expensesData),
      totalReceipts: getTotalReceipts(receiptsData),
      financialHealth: getFinancialHealth(goalsData, expensesData, receiptsData),
    }
  }, [goalsQuery.data, expensesQuery.data, receiptsQuery.data])

  const isLoading =
    goalsQuery.isLoading || expensesQuery.isLoading || receiptsQuery.isLoading

  const isError =
    goalsQuery.isError || expensesQuery.isError || receiptsQuery.isError

  const refetch = () =>
    Promise.all([
      goalsQuery.refetch(),
      expensesQuery.refetch(),
      receiptsQuery.refetch(),
    ])

  return {
    ...summary,
    isLoading,
    isError,
    refetch,
    queries: {
      goals: goalsQuery,
      expenses: expensesQuery,
      receipts: receiptsQuery,
    },
  }
}
