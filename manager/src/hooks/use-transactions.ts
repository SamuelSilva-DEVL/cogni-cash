import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/src/api/query-keys"
import {
  fetchTransactions,
  createTransaction,
} from "@/src/api/services/finance"
import {
  mapTransactionToExpense,
  mapTransactionToReceipt,
  toIsoDateTime,
} from "@/src/api/mappers"
import { CreateTransactionInput } from "@/src/api/types"
import { Expense, Receipt } from "@/src/types"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { useAuth } from "@/src/contexts/authContext"

export function useExpenses(page = 1) {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.transactions.byType("EXPENSE", page),
    queryFn: async () => {
      const data = await fetchTransactions("EXPENSE", page)
      return {
        expenses: data.transactions.map(mapTransactionToExpense),
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
      }
    },
    enabled: !!access_token,
  })
}

export function useReceipts(page = 1) {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.transactions.byType("INCOME", page),
    queryFn: async () => {
      const data = await fetchTransactions("INCOME", page)
      return {
        receipts: data.transactions.map(mapTransactionToReceipt),
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
      }
    },
    enabled: !!access_token,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expense: Omit<Expense, "id">) => {
      const input: CreateTransactionInput = {
        description: expense.description,
        amount: expense.value,
        date: toIsoDateTime(expense.date),
        type: "EXPENSE",
        categoryName: CATEGORY_LABELS[expense.category] ?? expense.category,
      }
      return createTransaction(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
  })
}

export function useCreateReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (receipt: Omit<Receipt, "id">) => {
      const input: CreateTransactionInput = {
        description: receipt.origin,
        amount: receipt.value,
        date: toIsoDateTime(receipt.date),
        type: "INCOME",
        source: receipt.origin,
      }
      return createTransaction(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
  })
}
