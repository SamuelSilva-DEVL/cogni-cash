import api from "@/src/api"
import {
  CreateGoalInput,
  CreateTransactionInput,
  GoalsListResponse,
  TransactionsListResponse,
  CategoriesListResponse,
  BudgetsListResponse,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "../types"

export async function fetchGoals(page = 1) {
  const { data } = await api.get<GoalsListResponse>("/goals", {
    params: { page },
  })
  return data
}

export async function createGoal(input: CreateGoalInput) {
  const { data } = await api.post("/goals", input)
  return data
}

export async function fetchTransactions(
  type: "INCOME" | "EXPENSE",
  page = 1,
) {
  const { data } = await api.get<TransactionsListResponse>("/transactions", {
    params: { type, page },
  })
  return data
}

export async function createTransaction(input: CreateTransactionInput) {
  const { data } = await api.post("/transactions", input)
  return data
}

export async function fetchCategories() {
  const { data } = await api.get<CategoriesListResponse>("/categories")
  return data
}

export async function fetchBudgets(month: number, year: number) {
  const { data } = await api.get<BudgetsListResponse>("/budgets", {
    params: { month, year },
  })
  return data
}

export async function createBudget(input: CreateBudgetInput) {
  const { data } = await api.post("/budgets", input)
  return data
}

export async function updateBudget(id: string, input: UpdateBudgetInput) {
  const { data } = await api.patch(`/budgets/${id}`, input)
  return data
}

export async function deleteBudget(id: string) {
  await api.delete(`/budgets/${id}`)
}
