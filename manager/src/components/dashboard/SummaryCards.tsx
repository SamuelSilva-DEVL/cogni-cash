import React from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { useFinance } from "@/src/contexts/FinanceContext"
import { formatCurrency } from "@/src/lib/utils"
import { TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react"

export const SummaryCards = () => {
  const { getTotalExpenses, getTotalReceipts } = useFinance()
  const expenses = getTotalExpenses()
  const receipts = getTotalReceipts()
  const balance = receipts - expenses.total

  const cards = [
    {
      title: "Receitas do Mês",
      value: formatCurrency(receipts),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Despesas Fixas",
      value: formatCurrency(expenses.fixed),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Despesas Variáveis",
      value: formatCurrency(expenses.variable),
      icon: TrendingDown,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? "text-emerald-600" : "text-red-600",
      bg: balance >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="animate-fade-in hover:shadow-md transition-shadow"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
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
