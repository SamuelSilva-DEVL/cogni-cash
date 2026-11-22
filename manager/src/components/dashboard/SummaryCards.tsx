import React from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { formatCurrency } from "@/src/lib/utils"
import { TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react"
import { cn } from "@/src/lib/utils"

export const SummaryCards = () => {
  const { totalExpenses, totalReceipts, isLoading } = useFinancialSummary()
  const balance = totalReceipts - totalExpenses.total

  const cards = [
    {
      title: "Receitas do mês",
      value: formatCurrency(totalReceipts),
      icon: TrendingUp,
      iconClass: "bg-brand-soft text-brand",
    },
    {
      title: "Despesas fixas",
      value: formatCurrency(totalExpenses.fixed),
      icon: DollarSign,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Despesas variáveis",
      value: formatCurrency(totalExpenses.variable),
      icon: TrendingDown,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Saldo disponível",
      value: formatCurrency(balance),
      icon: Wallet,
      iconClass: balance >= 0 ? "bg-brand-soft text-brand" : "bg-red-50 text-red-700",
      valueClass: balance >= 0 ? "text-foreground" : "text-destructive",
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
