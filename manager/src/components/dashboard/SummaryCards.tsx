import React from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useMonthlySummary } from "@/src/hooks/use-monthly-summary"
import { formatCurrency } from "@/src/lib/utils"
import { TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react"
import { cn } from "@/src/lib/utils"

const emptyMetric = { total: 0, percentage: 0, metrics: "" }

export const SummaryCards = () => {
  const { data, isLoading, isError } = useMonthlySummary()

  const incomes = data?.incomes ?? emptyMetric
  const fixedExpenses = data?.fixedExpenses ?? emptyMetric
  const variableExpenses = data?.variableExpenses ?? emptyMetric
  const rest = data?.rest ?? emptyMetric

  const cards = [
    {
      title: "Receitas do mês",
      value: formatCurrency(Number(incomes.total)),
      hint: incomes.metrics,
      percentage: Number(incomes.percentage),
      icon: TrendingUp,
      iconClass: "bg-brand-soft text-brand",
    },
    {
      title: "Despesas fixas",
      value: formatCurrency(Number(fixedExpenses.total)),
      hint: fixedExpenses.metrics,
      percentage: Number(fixedExpenses.percentage),
      icon: DollarSign,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Despesas variáveis",
      value: formatCurrency(Number(variableExpenses.total)),
      hint: variableExpenses.metrics,
      percentage: Number(variableExpenses.percentage),
      icon: TrendingDown,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Saldo disponível",
      value: formatCurrency(Number(rest.total)),
      hint: rest.metrics,
      percentage: Number(rest.percentage),
      icon: Wallet,
      iconClass: rest.total >= 0 ? "bg-brand-soft text-brand" : "bg-red-50 text-red-700",
      valueClass: rest.total >= 0 ? "text-foreground" : "text-destructive",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar o resumo do mês.
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p
                  className={cn(
                    "mt-1 font-mono text-xl font-semibold tabular-nums text-foreground",
                    card.valueClass,
                  )}
                >
                  {card.value}
                </p>
                {card.hint && card.percentage !== 0 ? (
                  <p
                    className={cn(
                      "mt-2 flex items-start gap-1 text-xs leading-snug",
                      card.percentage > 0 ? "text-brand" : "text-destructive",
                    )}
                  >
                    {card.percentage > 0 ? (
                      <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>{card.hint}</span>
                  </p>
                ) : null}
              </div>
              <div className={cn("rounded-full p-2.5", card.iconClass)}>
                <card.icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
