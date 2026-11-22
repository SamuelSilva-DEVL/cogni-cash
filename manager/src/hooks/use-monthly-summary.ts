import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/src/api/query-keys"
import { fetchMonthlySummary } from "@/src/api/services/finance"
import { useAuth } from "@/src/contexts/authContext"

export function useMonthlySummary() {
  const { access_token } = useAuth()

  return useQuery({
    queryKey: queryKeys.metrics.monthlySummary(),
    queryFn: fetchMonthlySummary,
    enabled: !!access_token,
  })
}
