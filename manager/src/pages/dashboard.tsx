import React from "react"
import { FinancialHealthCard } from "@/src/components/dashboard/FinancialHealthCard"
import { SummaryCards } from "@/src/components/dashboard/SummaryCards"
import { GoalsGrid } from "@/src/components/dashboard/GoalsGrid"
import { ExpenseCategoriesTable } from "@/src/components/dashboard/ExpenseCategoriesTable"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground text-balance">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-700">
          Visão clara do mês — registre nas páginas de despesas, receitas e
          metas.
        </p>
      </div>

      <SummaryCards />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpenseCategoriesTable />
        </div>
        <div className="lg:col-span-2">
          <FinancialHealthCard />
        </div>
      </div>

      <GoalsGrid />
    </div>
  )
}
