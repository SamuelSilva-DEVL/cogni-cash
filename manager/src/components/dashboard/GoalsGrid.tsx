import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/src/components/ui/card'
import { Progress } from '@/src/components/ui/progress'
import { useFinance } from '@/src/contexts/FinanceContext'
import { formatCurrency, calculatePercentage, getDaysRemaining } from '@/src/lib/utils'
import { Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export const GoalsGrid = () => {
  const { goals } = useFinance()
  const activeGoals = goals.filter(g => g.active).slice(0, 6)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Minhas Metas</h2>
        <Link href="/goals" className="text-sm text-primary hover:underline font-medium">
          Ver todas →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeGoals.map((goal, index) => {
          const progress = calculatePercentage(goal.currentValue, goal.totalValue)
          const daysRemaining = getDaysRemaining(goal.deadlineDate)
          const isAtRisk = daysRemaining < 60 && progress < 70

          return (
            <Link key={goal.id} href={`/goals/${goal.id}`}>
              <Card 
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in border-2',
                  isAtRisk ? 'border-amber-200 bg-amber-50/30' : 'hover:border-primary/20'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-base line-clamp-1">{goal.name}</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatCurrency(goal.currentValue)} de {formatCurrency(goal.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-primary">{progress}%</span>
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {isAtRisk && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        <TrendingUp className="h-3 w-3" />
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
    </div>
  )
}
