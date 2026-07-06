import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { formatCurrency } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"

export const ExpenseCategoriesTable = () => {
  const { categoryExpenses: categories, isLoading } = useFinancialSummary()

  const categoryColors: Record<string, string> = {
    alimentacao: "bg-amber-500",
    transporte: "bg-blue-500",
    moradia: "bg-slate-600",
    saude: "bg-red-500",
    educacao: "bg-indigo-500",
    lazer: "bg-pink-500",
    outros: "bg-slate-500",
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 text-center py-6">
            Registre despesas para ver a distribuição por categoria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">
                  {CATEGORY_LABELS[category.category] || category.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-700 tabular-nums font-mono">
                    {formatCurrency(category.value)}
                  </span>
                  <span className="font-semibold text-slate-900 min-w-[3rem] text-right tabular-nums font-mono">
                    {category.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${categoryColors[category.category] || "bg-slate-500"}`}
                  style={{ width: `${category.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={category.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${CATEGORY_LABELS[category.category] || category.category}: ${category.percentage}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
