export interface ApiGoal {
  id: string
  title: string
  targetAmount: string | number
  currentAmount: string | number
  deadline: string | null
  slug: string
  accountId: string
  createdAt: string
  updatedAt: string
}

export interface ApiTransaction {
  id: string
  description: string
  amount: string
  date: string
  type: "INCOME" | "EXPENSE"
  categoryName: string | null
  source: string | null
  createdAt: string
}

export interface ApiCategory {
  id: string
  name: string
  createdAt: string
}

export interface GoalsListResponse {
  goals: ApiGoal[]
}

export interface TransactionsListResponse {
  transactions: ApiTransaction[]
  total: number
  page: number
  pageSize: number
}

export interface CategoriesListResponse {
  categories: ApiCategory[]
  total: number
}

export interface CreateGoalInput {
  title: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
}

export interface CreateTransactionInput {
  description: string
  amount: number
  date: string
  type: "INCOME" | "EXPENSE"
  categoryName?: string
  source?: string
}

export interface CategoryBudgetItem {
  budgetId: string | null
  categoryId: string
  categoryName: string
  month: number
  year: number
  limit: number | null
  spent: number
  remaining: number | null
  percentUsed: number | null
  status: "ok" | "warning" | "exceeded" | "no_limit"
}

export interface BudgetsListResponse {
  month: number
  year: number
  items: CategoryBudgetItem[]
}

export interface CreateBudgetInput {
  categoryId?: string
  categoryName?: string
  limit: number
  month: number
  year: number
}

export interface UpdateBudgetInput {
  limit: number
}
