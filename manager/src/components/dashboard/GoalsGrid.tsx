import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useGoals } from "@/src/hooks/use-goals"
import {
  formatCurrency,
  calculatePercentage,
  getDaysRemaining,
} from "@/src/lib/utils"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/src/lib/utils"

export const GoalsGrid = () => {
  const { data: goals = [], isLoading } = useGoals()
  const activeGoals = goals.filter((g) => g.active).slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Metas em andamento</CardTitle>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950"
        >
          Ver todas
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-700">
            Nenhuma meta cadastrada. Crie a primeira na página de metas.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {activeGoals.map((goal) => {
              const progress = calculatePercentage(goal.currentValue, goal.totalValue)
              const daysRemaining = getDaysRemaining(goal.deadlineDate)
              const isAtRisk = daysRemaining < 60 && progress < 70

              return (
                <li key={goal.id}>
                  <Link
                    href={`/goals/${goal.id}`}
                    className="flex items-center gap-4 py-4 transition-colors hover:bg-muted/60"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {goal.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">
                          {goal.name}
                        </p>
                        <p className="flex-shrink-0 font-mono text-sm font-semibold tabular-nums">
                          {progress}%
                        </p>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                      <p
                        className={cn(
                          "mt-1.5 text-xs text-slate-600",
                          isAtRisk && "text-amber-800",
                        )}
                      >
                        {formatCurrency(goal.currentValue)} de{" "}
                        {formatCurrency(goal.totalValue)}
                        {isAtRisk ? " · vale um olhar" : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
