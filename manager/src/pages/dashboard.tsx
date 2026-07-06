import React from "react"
import { Layout } from "@/src/components/Layout"
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
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
              Dashboard Financeiro
            </h1>
            <p className="text-slate-700">
              Registre movimentações e acompanhe seu progresso com calma.
            </p>
          </div>
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
