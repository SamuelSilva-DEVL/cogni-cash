import React from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { formatCurrency } from "@/src/lib/utils"
import { TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react"

export const SummaryCards = () => {
  const { totalExpenses, totalReceipts, isLoading } = useFinancialSummary()
  const balance = totalReceipts - totalExpenses.total

  const cards = [
    {
      title: "Receitas do Mês",
      value: formatCurrency(totalReceipts),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Despesas Fixas",
      value: formatCurrency(totalExpenses.fixed),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Despesas Variáveis",
      value: formatCurrency(totalExpenses.variable),
      icon: TrendingDown,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? "text-emerald-600" : "text-red-600",
      bg: balance >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700 mb-1">{card.title}</p>
                <p className="text-2xl font-bold tabular-nums font-mono text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
