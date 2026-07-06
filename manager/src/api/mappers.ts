import { Goal, Expense, Receipt } from "@/src/types"
import { ApiGoal, ApiTransaction } from "./types"

const CATEGORY_SLUG_MAP: Record<string, Expense["category"]> = {
  alimentacao: "alimentacao",
  alimentação: "alimentacao",
  transporte: "transporte",
  moradia: "moradia",
  saude: "saude",
  saúde: "saude",
  educacao: "educacao",
  educação: "educacao",
  lazer: "lazer",
  outros: "outros",
}

function normalizeCategoryName(name: string | null | undefined): Expense["category"] {
  if (!name) return "outros"
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  return CATEGORY_SLUG_MAP[key] ?? "outros"
}

export function mapApiGoalToGoal(apiGoal: ApiGoal): Goal {
  return {
    id: apiGoal.id,
    name: apiGoal.title,
    totalValue: Number(apiGoal.targetAmount),
    currentValue: Number(apiGoal.currentAmount),
    deadlineDate: apiGoal.deadline
      ? new Date(apiGoal.deadline).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: "outros",
    icon: "🎯",
    active: true,
    createdAt: apiGoal.createdAt,
  }
}

export function mapTransactionToExpense(transaction: ApiTransaction): Expense {
  return {
    id: transaction.id,
    value: Number(transaction.amount),
    category: normalizeCategoryName(transaction.categoryName),
    type: "variavel",
    date: transaction.date.split("T")[0],
    description: transaction.description,
  }
}

export function mapTransactionToReceipt(transaction: ApiTransaction): Receipt {
  return {
    id: transaction.id,
    value: Number(transaction.amount),
    origin: transaction.source || transaction.description,
    date: transaction.date.split("T")[0],
    recurrence: "unico",
  }
}

export function toIsoDateTime(date: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  return parsed.toISOString()
}
