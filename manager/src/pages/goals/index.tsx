import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import { GoalFormDialog } from "@/src/components/goals/GoalFormDialog"
import { useGoals } from "@/src/hooks/use-goals"
import {
  formatCurrency,
  calculatePercentage,
  getDaysRemaining,
} from "@/src/lib/utils"
import { Plus, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Goal } from "@/src/types"

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingGoal(undefined)
  }

  const activeGoals = goals.filter((g) => g.active)
  const completedGoals = activeGoals.filter(
    (g) => calculatePercentage(g.currentValue, g.totalValue) >= 100,
  )
  const inProgressGoals = activeGoals.filter(
    (g) => calculatePercentage(g.currentValue, g.totalValue) < 100,
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
              Minhas Metas
            </h1>
            <p className="text-slate-700">
              Defina objetivos e acompanhe cada passo com calma.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} variant="soft" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-700 mb-2">Total de metas</p>
              <p className="text-4xl font-bold tabular-nums font-mono text-foreground">
                {activeGoals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-700 mb-2">Em progresso</p>
              <p className="text-4xl font-bold tabular-nums font-mono text-blue-600">
                {inProgressGoals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-700 mb-2">Concluídas</p>
              <p className="text-4xl font-bold tabular-nums font-mono text-emerald-600">
                {completedGoals.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const progress = calculatePercentage(
              goal.currentValue,
              goal.totalValue,
            )
            const daysRemaining = getDaysRemaining(goal.deadlineDate)
            const isAtRisk = daysRemaining < 60 && progress < 70
            const isCompleted = progress >= 100

            return (
              <Card
                key={goal.id}
                className={cn(
                  "border transition-shadow hover:shadow-md",
                  isAtRisk && "border-amber-200 bg-amber-50/30",
                  isCompleted && "border-emerald-200 bg-emerald-50/30",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <Link href={`/goals/${goal.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl shrink-0" aria-hidden="true">
                          {goal.icon}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xl mb-1 truncate hover:text-emerald-700 transition-colors">
                            {goal.name}
                          </h3>
                          <p className="text-sm text-slate-700 tabular-nums font-mono">
                            {formatCurrency(goal.currentValue)} de{" "}
                            {formatCurrency(goal.totalValue)}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                      className="shrink-0"
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold tabular-nums font-mono">
                          {progress}%
                        </span>
                        <span className="text-sm text-slate-700 flex items-center gap-1">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {daysRemaining > 0
                            ? `${daysRemaining} dias restantes`
                            : "Prazo vencido"}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          <TrendingUp className="h-4 w-4" aria-hidden="true" />
                          <span className="font-medium">Meta alcançada</span>
                        </div>
                      )}
                      {isAtRisk && !isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                          <AlertCircle className="h-4 w-4" aria-hidden="true" />
                          <span className="font-medium">Vale um olhar</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-600 tabular-nums font-mono">
                        Faltam {formatCurrency(goal.totalValue - goal.currentValue)}{" "}
                        para concluir
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {activeGoals.length === 0 && (
            <Card className="border border-dashed">
              <CardContent className="p-12 text-center">
                <p className="text-4xl mb-4" aria-hidden="true">
                  🎯
                </p>
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma meta ainda
                </h3>
                <p className="text-slate-700 mb-6 max-w-sm mx-auto">
                  Que tal começar com um objetivo simples? Cada meta é um passo
                  na direção certa.
                </p>
                <Button onClick={() => setIsFormOpen(true)} variant="soft" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeira meta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <GoalFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        goal={editingGoal}
        mode={editingGoal ? "edit" : "create"}
      />
    </>
  )
}
