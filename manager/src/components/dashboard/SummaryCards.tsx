import React from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { formatCurrency } from "@/src/lib/utils"
import { TrendingDown, TrendingUp, PiggyBank } from "lucide-react"

export const SummaryCards = () => {
  const { totalExpenses, totalReceipts, isLoading } = useFinancialSummary()
  const expenses = totalExpenses.total
  const balance = totalReceipts - expenses

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-0 bg-emerald-700 text-white shadow-none sm:col-span-2 xl:col-span-1">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <p className="text-sm font-medium text-emerald-50">Saldo do mês</p>
          <p className="mt-6 font-mono text-3xl font-bold tabular-nums tracking-tight">
            {formatCurrency(balance)}
          </p>
          <p className="mt-3 text-sm text-emerald-100">
            Receitas menos despesas registradas neste período.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Receitas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </span>
          </div>
          <p className="mt-4 font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(totalReceipts)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Despesas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <TrendingDown className="h-4 w-4 text-slate-700" />
            </span>
          </div>
          <p className="mt-4 font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(expenses)}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {formatCurrency(totalExpenses.fixed)} fixas ·{" "}
            {formatCurrency(totalExpenses.variable)} variáveis
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Economia</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <PiggyBank className="h-4 w-4 text-emerald-700" />
            </span>
          </div>
          <p className="mt-4 font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(Math.max(balance, 0))}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {totalReceipts > 0
              ? `${Math.round((Math.max(balance, 0) / totalReceipts) * 100)}% da receita`
              : "Registre receitas para ver a taxa"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
