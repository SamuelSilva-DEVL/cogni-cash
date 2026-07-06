import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/src/api/query-keys"
import { fetchGoals, createGoal } from "@/src/api/services/finance"
import { mapApiGoalToGoal } from "@/src/api/mappers"
import { CreateGoalInput } from "@/src/api/types"
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

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all })
    },
  })
}

export function useGoalById(id: string | undefined) {
  const { data: goals, ...rest } = useGoals()
  const goal = goals?.find((g) => g.id === id)

  return { goal, goals, ...rest }
}
