export const queryKeys = {
  goals: {
    all: ["goals"] as const,
    list: (page = 1) => [...queryKeys.goals.all, "list", page] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    byType: (type: "INCOME" | "EXPENSE", page = 1) =>
      [...queryKeys.transactions.all, type, page] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    list: (month: number, year: number) =>
      [...queryKeys.budgets.all, "list", month, year] as const,
  },
}
