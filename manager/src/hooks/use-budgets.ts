import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { queryKeys } from "@/src/api/query-keys"
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "@/src/api/services/finance"
import { CreateBudgetInput, UpdateBudgetInput } from "@/src/api/types"
import { useAuth } from "@/src/contexts/authContext"

export function useCategoryBudgets(month: number, year: number) {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.budgets.list(month, year),
    queryFn: () => fetchBudgets(month, year),
    enabled: !!access_token,
  })
}

export function useCreateBudget(month: number, year: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<CreateBudgetInput, "month" | "year">) =>
      createBudget({ ...input, month, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.list(month, year) })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateBudget(month: number, year: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBudgetInput & { id: string }) =>
      updateBudget(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.list(month, year) })
    },
  })
}

export function useDeleteBudget(month: number, year: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.list(month, year) })
    },
  })
}

export function isBudgetConflict(error: unknown) {
  return isAxiosError(error) && error.response?.status === 409
}
