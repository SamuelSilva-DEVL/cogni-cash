import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/src/api/query-keys"
import {
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/src/api/services/finance"
import { mapApiGoalToGoal } from "@/src/api/mappers"
import { CreateGoalInput, UpdateGoalInput } from "@/src/api/types"
import { useAuth } from "@/src/contexts/authContext"

export function useGoals(page = 1) {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.goals.list(page),
    queryFn: async () => {
      const data = await fetchGoals(page)
      return data.goals.map(mapApiGoalToGoal)
    },
    enabled: !!access_token,
  })
}

export function useGoalById(id: string | undefined) {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.goals.detail(id ?? ""),
    queryFn: async () => {
      const data = await fetchGoalById(id as string)
      return mapApiGoalToGoal(data.goal)
    },
    enabled: !!access_token && !!id,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateGoalInput & { id: string }) =>
      updateGoal(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all })
    },
  })
}
