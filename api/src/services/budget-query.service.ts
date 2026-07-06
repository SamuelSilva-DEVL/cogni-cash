import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import {
  computeBudgetProgress,
  getMonthDateRange,
} from "./budget-progress.service"

@Injectable()
export class BudgetQueryService {
  constructor(private prisma: PrismaService) {}

  async listWithProgress(accountId: string, month: number, year: number) {
    const categories = await this.prisma.category.findMany({
      where: { accountId },
      orderBy: { name: "asc" },
    })

    const budgets = await this.prisma.budget.findMany({
      where: { accountId, month, year },
    })

    const budgetByCategory = new Map(
      budgets.map((budget) => [budget.categoryId, budget]),
    )

    const { periodStart, periodEnd } = getMonthDateRange(month, year)

    const expenseTotals = await this.prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        accountId,
        type: "EXPENSE",
        categoryId: { not: null },
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const spentByCategory = new Map(
      expenseTotals.map((item) => [
        item.categoryId,
        Number(item._sum.amount ?? 0),
      ]),
    )

    const items = categories.map((category) => {
      const budget = budgetByCategory.get(category.id)
      const limit = budget ? Number(budget.limit) : null
      const spent = spentByCategory.get(category.id) ?? 0
      const progress = computeBudgetProgress(limit, spent)

      return {
        budgetId: budget?.id ?? null,
        categoryId: category.id,
        categoryName: category.name,
        month,
        year,
        ...progress,
      }
    })

    return { month, year, items }
  }
}
