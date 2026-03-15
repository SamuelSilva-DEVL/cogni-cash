import React from "react"
import { Layout } from "@/src/components/Layout"
import { FinancialHealthCard } from "@/src/components/dashboard/FinancialHealthCard"
import { SummaryCards } from "@/src/components/dashboard/SummaryCards"
import { GoalsGrid } from "@/src/components/dashboard/GoalsGrid"
import { GoalsProgressChart } from "@/src/components/dashboard/GoalsProgressChart"
import { ExpenseCategoriesTable } from "@/src/components/dashboard/ExpenseCategoriesTable"

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-slate-600">
            Visão geral completa das suas finanças pessoais
          </p>
        </div>

        <SummaryCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <FinancialHealthCard />
          <ExpenseCategoriesTable />
        </div>

        <GoalsProgressChart />

        <GoalsGrid />
      </div>
    </Layout>
  )
}
