import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useGoals } from "@/src/hooks/use-goals"
import {
  formatCurrency,
  calculatePercentage,
  getDaysRemaining,
} from "@/src/lib/utils"
import { Clock, TrendingUp } from "lucide-react"
import { cn } from "@/src/lib/utils"

export const GoalsGrid = () => {
  const { data: goals = [], isLoading } = useGoals()
  const activeGoals = goals.filter((g) => g.active).slice(0, 6)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Minhas Metas</h2>
        <Link
          href="/goals"
          className="text-sm text-emerald-700 hover:underline font-medium"
        >
          Ver todas →
        </Link>
      </div>

      {activeGoals.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="p-8 text-center text-slate-700">
            <p className="font-medium mb-1">Nenhuma meta cadastrada</p>
            <p className="text-sm">Crie sua primeira meta para acompanhar o progresso.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeGoals.map((goal) => {
            const progress = calculatePercentage(
              goal.currentValue,
              goal.totalValue,
            )
            const daysRemaining = getDaysRemaining(goal.deadlineDate)
            const isAtRisk = daysRemaining < 60 && progress < 70

            return (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <Card
                  className={cn(
                    "cursor-pointer transition-shadow hover:shadow-md border",
                    isAtRisk
                      ? "border-amber-200 bg-amber-50/30"
                      : "hover:border-emerald-200",
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl" aria-hidden="true">
                          {goal.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold text-base line-clamp-1">
                            {goal.name}
                          </h3>
                          <p className="text-xs text-slate-700 mt-1 tabular-nums font-mono">
                            {formatCurrency(goal.currentValue)} de{" "}
                            {formatCurrency(goal.totalValue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold tabular-nums font-mono">
                            {progress}%
                          </span>
                          <span className="text-xs text-slate-700 flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {daysRemaining > 0
                              ? `${daysRemaining} dias`
                              : "Vencido"}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {isAtRisk && (
                        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded">
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                          <span>Requer atenção</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
