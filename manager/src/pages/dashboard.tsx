import React from "react"
import { PageHeader } from "@/src/components/PageHeader"
import { FinancialHealthCard } from "@/src/components/dashboard/FinancialHealthCard"
import { SummaryCards } from "@/src/components/dashboard/SummaryCards"
import { GoalsGrid } from "@/src/components/dashboard/GoalsGrid"
import { ExpenseCategoriesTable } from "@/src/components/dashboard/ExpenseCategoriesTable"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard financeiro"
        description="Registre movimentações e acompanhe o progresso com calma."
      />

      <SummaryCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialHealthCard />
        <ExpenseCategoriesTable />
      </div>

      <GoalsGrid />
    </div>
  )
}
