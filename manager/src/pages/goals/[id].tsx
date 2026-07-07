import React from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Layout } from "@/src/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { Button } from "@/src/components/ui/button"
import { useGoalById } from "@/src/hooks/use-goals"
import { Skeleton } from "@/src/components/ui/skeleton"
import {
  formatCurrency,
  calculatePercentage,
  getDaysRemaining,
  formatDate,
} from "@/src/lib/utils"
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Target,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/src/lib/utils"

const CHART_BORDER = "oklch(0.922 0 0)"
const CHART_MUTED = "oklch(0.554 0.022 256)"
const CHART_EMERALD = "oklch(0.596 0.145 163)"

export default function GoalDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { goal, isLoading } = useGoalById(typeof id === "string" ? id : undefined)

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    )
  }

  if (!goal) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-4">
          <p className="text-slate-700">Meta não encontrada.</p>
          <Link href="/goals">
            <Button variant="soft">Voltar para metas</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const progress = calculatePercentage(goal.currentValue, goal.totalValue)
  const daysRemaining = getDaysRemaining(goal.deadlineDate)
  const isAtRisk = daysRemaining < 60 && progress < 70
  const isCompleted = progress >= 100
  const remaining = goal.totalValue - goal.currentValue

  const progressHistory = [
    { month: "Jan", value: goal.currentValue * 0.2 },
    { month: "Fev", value: goal.currentValue * 0.4 },
    { month: "Mar", value: goal.currentValue * 0.6 },
    { month: "Abr", value: goal.currentValue * 0.8 },
    { month: "Mai", value: goal.currentValue },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Link href="/goals">
            <Button variant="soft" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="flex items-center gap-6">
            <span className="text-6xl shrink-0" aria-hidden="true">
              {goal.icon}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
                {goal.name}
              </h1>
              <p className="text-slate-700">
                Acompanhe o progresso desta meta no seu ritmo.
              </p>
            </div>
          </div>
        </div>

        {(isAtRisk || isCompleted) && (
          <div
            className={cn(
              "p-4 rounded-lg border flex items-center gap-3",
              isCompleted
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200",
            )}
            role="status"
          >
            {isCompleted ? (
              <>
                <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Meta alcançada
                  </p>
                  <p className="text-sm text-emerald-800">
                    Você chegou ao objetivo — parabéns pelo compromisso.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Meta precisa de atenção
                  </p>
                  <p className="text-sm text-amber-800">
                    O prazo está próximo; vamos ajustar o plano juntos.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-slate-600" aria-hidden="true" />
                <p className="text-sm text-slate-700">Valor total</p>
              </div>
              <p className="text-3xl font-bold tabular-nums font-mono">
                {formatCurrency(goal.totalValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <p className="text-sm text-slate-700">Valor atual</p>
              </div>
              <p className="text-3xl font-bold tabular-nums font-mono text-emerald-700">
                {formatCurrency(goal.currentValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <p className="text-sm text-slate-700">Dias restantes</p>
              </div>
              <p className="text-3xl font-bold tabular-nums font-mono text-blue-600">
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progresso da meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-5xl font-bold tabular-nums font-mono">
                  {progress}%
                </span>
                <div className="text-right">
                  <p className="text-sm text-slate-700">Faltam</p>
                  <p className="text-xl font-semibold tabular-nums font-mono text-foreground">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Data de início
                </p>
                <p className="font-semibold">{formatDate(goal.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Data limite
                </p>
                <p className="font-semibold">{formatDate(goal.deadlineDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label={`Gráfico de evolução da meta ${goal.name}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER} />
                  <XAxis dataKey="month" stroke={CHART_MUTED} />
                  <YAxis stroke={CHART_MUTED} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: `1px solid ${CHART_BORDER}`,
                      borderRadius: "0.625rem",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_EMERALD}
                    strokeWidth={3}
                    dot={{ fill: CHART_EMERALD, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>Evolução mensal da meta</caption>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {progressHistory.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{formatCurrency(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
