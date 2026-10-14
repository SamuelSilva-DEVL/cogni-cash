import React from "react"
import { Layout } from "@/src/components/Layout"
import { PageHeader } from "@/src/components/PageHeader"
import { FinancialHealthCard } from "@/src/components/dashboard/FinancialHealthCard"
import { SummaryCards } from "@/src/components/dashboard/SummaryCards"
import { GoalsGrid } from "@/src/components/dashboard/GoalsGrid"
import { ExpenseCategoriesTable } from "@/src/components/dashboard/ExpenseCategoriesTable"
import { QuickActions } from "@/src/components/dashboard/QuickActions"

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-4">
          <PageHeader
            title="Dashboard financeiro"
            description="Registre movimentações e acompanhe o progresso com calma."
          />
          <QuickActions />
        </div>

        <SummaryCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <FinancialHealthCard />
          <ExpenseCategoriesTable />
        </div>

        <GoalsGrid />
      </div>
    </Layout>
  )
}
