import React, { useState } from "react"
import Link from "next/link"
import { Layout } from "@/src/components/Layout"
import { PageHeader } from "@/src/components/PageHeader"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
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
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader
          title="Minhas metas"
          description="Defina objetivos e acompanhe cada passo com calma."
        >
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total de metas</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                {activeGoals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Em progresso</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-blue-700">
                {inProgressGoals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-brand">
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
                  isAtRisk && "border-amber-300 bg-amber-50",
                  isCompleted && "border-brand/30 bg-brand-soft/60",
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
                          <h3 className="mb-1 truncate text-lg font-semibold transition-colors hover:text-brand">
                            {goal.name}
                          </h3>
                          <p className="font-mono text-sm tabular-nums text-muted-foreground">
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
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
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
                        <Badge tone="brand">
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                          Meta alcançada
                        </Badge>
                      )}
                      {isAtRisk && !isCompleted && (
                        <Badge tone="warning">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Vale um olhar
                        </Badge>
                      )}
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
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
                <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
                  Que tal começar com um objetivo simples? Cada meta é um passo
                  na direção certa.
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
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
    </Layout>
  )
}
