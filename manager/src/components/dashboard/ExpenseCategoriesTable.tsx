import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useFinance } from '@/src/contexts/FinanceContext'
import { formatCurrency } from '@/src/lib/utils'
import { CATEGORY_LABELS } from '@/src/lib/mockData'

export const ExpenseCategoriesTable = () => {
  const { getCategoryExpenses } = useFinance()
  const categories = getCategoryExpenses()

  const categoryColors: Record<string, string> = {
    alimentacao: 'bg-amber-500',
    transporte: 'bg-blue-500',
    moradia: 'bg-purple-500',
    saude: 'bg-red-500',
    educacao: 'bg-indigo-500',
    lazer: 'bg-pink-500',
    outros: 'bg-slate-500',
  }

  return (
    <Card className="animate-fade-in animate-delay-200">
      <CardHeader>
        <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {CATEGORY_LABELS[category.category] || category.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">{formatCurrency(category.value)}</span>
                  <span className="font-semibold text-slate-900 min-w-[3rem] text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${categoryColors[category.category] || 'bg-slate-500'}`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
