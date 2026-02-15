import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useFinance } from '@/src/contexts/FinanceContext'
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export const FinancialHealthCard = () => {
  const { getFinancialHealth } = useFinance()
  const health = getFinancialHealth()

  const statusConfig = {
    excelente: {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: TrendingUp,
      label: 'Excelente',
      description: 'Suas finanças estão em ótimo estado!',
    },
    bom: {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Activity,
      label: 'Bom',
      description: 'Você está no caminho certo!',
    },
    atencao: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertCircle,
      label: 'Atenção',
      description: 'Algumas áreas precisam de atenção.',
    },
    critico: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: TrendingDown,
      label: 'Crítico',
      description: 'Ação imediata necessária!',
    },
  }

  const config = statusConfig[health.status]
  const StatusIcon = config.icon

  return (
    <Card className={cn('border-2 animate-fade-in', config.border)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Saúde Financeira</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className={cn('p-3 rounded-full', config.bg)}>
            <StatusIcon className={cn('h-6 w-6', config.color)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{health.score}</span>
                <span className={cn('text-sm font-semibold px-3 py-1 rounded-full', config.bg, config.color)}>
                  {config.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={cn(
                    'max-w-full h-2 rounded-full transition-all duration-500',
                    health.status === 'excelente' && 'bg-emerald-500',
                    health.status === 'bom' && 'bg-blue-500',
                    health.status === 'atencao' && 'bg-amber-500',
                    health.status === 'critico' && 'bg-red-500'
                  )}
                  style={{ width: `${health.score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-600 mb-1">Gastos/Receita</p>
              <p className="text-lg font-semibold">{Math.round(health.factors.expenseRatio)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Taxa Poupança</p>
              <p className="text-lg font-semibold">{Math.round(health.factors.savingsRate)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Metas no Prazo</p>
              <p className="text-lg font-semibold">{Math.round(health.factors.goalsOnTrack)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
