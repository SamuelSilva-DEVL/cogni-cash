import React, { useState } from "react"
import Link from "next/link"
import { Layout } from "@/src/components/Layout"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { GoalFormDialog } from "@/src/components/goals/GoalFormDialog"
import { useFinance } from "@/src/contexts/FinanceContext"
import {
  formatCurrency,
  calculatePercentage,
  getDaysRemaining,
} from "@/src/lib/utils"
import {
  Plus,
  Clock,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Goal } from "@/src/types"

export default function GoalsPage() {
  const { goals, deleteGoal } = useFinance()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleDelete = (goalId: string) => {
    setGoalToDelete(goalId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete)
      setDeleteDialogOpen(false)
      setGoalToDelete(null)
    }
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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas Metas</h1>
            <p className="text-slate-600">
              Gerencie suas metas financeiras e acompanhe seu progresso
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Total de Metas</p>
                <p className="text-4xl font-bold text-primary">
                  {activeGoals.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Em Progresso</p>
                <p className="text-4xl font-bold text-blue-600">
                  {inProgressGoals.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Concluídas</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {completedGoals.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {activeGoals.map((goal, index) => {
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
                  "animate-fade-in border-2 transition-all hover:shadow-lg",
                  isAtRisk && "border-amber-200 bg-amber-50/20",
                  isCompleted && "border-emerald-200 bg-emerald-50/20",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/goals/${goal.id}`} className="flex-1">
                      <div className="flex items-center space-x-4 cursor-pointer group">
                        <span className="text-5xl group-hover:scale-110 transition-transform">
                          {goal.icon}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                            {goal.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {formatCurrency(goal.currentValue)} de{" "}
                            {formatCurrency(goal.totalValue)}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(goal)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-primary">
                          {progress}%
                        </span>
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {daysRemaining > 0
                            ? `${daysRemaining} dias restantes`
                            : "Prazo vencido"}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">Meta alcançada!</span>
                        </div>
                      )}
                      {isAtRisk && !isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Requer atenção</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        Faltam{" "}
                        {formatCurrency(goal.totalValue - goal.currentValue)}{" "}
                        para concluir
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {activeGoals.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma meta cadastrada
                </h3>
                <p className="text-slate-600 mb-4">
                  Comece criando sua primeira meta financeira!
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeira Meta
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
