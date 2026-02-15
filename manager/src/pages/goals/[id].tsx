import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Layout } from '@/src/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Progress } from '@/src/components/ui/progress'
import { Button } from '@/src/components/ui/button'
import { useFinance } from '@/src/contexts/FinanceContext'
import { formatCurrency, calculatePercentage, getDaysRemaining, formatDate } from '@/src/lib/utils'
import { ArrowLeft, Calendar, Clock, TrendingUp, AlertCircle, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/src/lib/utils'

export default function GoalDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { getGoalById } = useFinance()

  const goal = getGoalById(id as string)

  if (!goal) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Meta não encontrada</p>
          <Link href="/goals">
            <Button>Voltar para Metas</Button>
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

  // Simulating progress history
  const progressHistory = [
    { month: 'Jan', value: goal.currentValue * 0.2 },
    { month: 'Fev', value: goal.currentValue * 0.4 },
    { month: 'Mar', value: goal.currentValue * 0.6 },
    { month: 'Abr', value: goal.currentValue * 0.8 },
    { month: 'Mai', value: goal.currentValue },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Link href="/goals">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="flex items-center gap-6">
            <span className="text-7xl">{goal.icon}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">{goal.name}</h1>
              <p className="text-slate-600">
                Acompanhe o progresso detalhado da sua meta
              </p>
            </div>
          </div>
        </div>

        {(isAtRisk || isCompleted) && (
          <div
            className={cn(
              'p-4 rounded-lg border-2 flex items-center gap-3',
              isCompleted
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            )}
          >
            {isCompleted ? (
              <>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Parabéns! Meta alcançada! 🎉
                  </p>
                  <p className="text-sm text-emerald-700">
                    Você conseguiu atingir seu objetivo financeiro.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Atenção: Meta em risco
                  </p>
                  <p className="text-sm text-amber-700">
                    O prazo está próximo e o progresso está abaixo do esperado.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <p className="text-sm text-slate-600">Valor Total</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(goal.totalValue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-slate-600">Valor Atual</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(goal.currentValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-slate-600">Dias Restantes</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progresso da Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-5xl font-bold text-primary">{progress}%</span>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Faltam</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Início
                </p>
                <p className="font-semibold">{formatDate(goal.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data Limite
                </p>
                <p className="font-semibold">{formatDate(goal.deadlineDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
