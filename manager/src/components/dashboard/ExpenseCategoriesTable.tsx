import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { formatCurrency } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const CATEGORY_COLORS: Record<string, string> = {
  alimentacao: "#d97706",
  transporte: "#2563eb",
  moradia: "#475569",
  saude: "#dc2626",
  educacao: "#4f46e5",
  lazer: "#db2777",
  outros: "#64748b",
}

export const ExpenseCategoriesTable = () => {
  const { categoryExpenses: categories, totalExpenses, isLoading } = useFinancialSummary()

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto size-40 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-10 text-center text-sm text-slate-700">
            Registre despesas para ver a distribuição por categoria.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = categories.map((category) => ({
    name: CATEGORY_LABELS[category.category] || category.category,
    value: category.value,
    percentage: category.percentage,
    color: CATEGORY_COLORS[category.category] || "#64748b",
  }))

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.922 0 0)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-600">Total</span>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {formatCurrency(totalExpenses.total)}
              </span>
            </div>
          </div>

          <ul className="space-y-3">
            {chartData.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-slate-800">{entry.name}</span>
                </span>
                <span className="flex-shrink-0 font-mono text-slate-700 tabular-nums">
                  {entry.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
