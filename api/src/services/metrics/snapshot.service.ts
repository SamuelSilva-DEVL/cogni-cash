import { PrismaService } from "@/prisma/prisma.service"
import { getPreviousMonthDateRange } from "@/utils/timezone-date"
import { Injectable } from "@nestjs/common"

@Injectable()
export class SnapshotService {
  constructor(private prisma: PrismaService) {}

  async createSnapshot(accountId: string, accountMemberId: string) {
    const { year, month, periodStart, periodEnd } = getPreviousMonthDateRange()

    const [totalVariableExpenses, totalFixedExpenses, totalIncomes] =
      await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            accountId,
            type: "EXPENSE",
            expenseKind: "VARIABLE",
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            accountId,
            type: "EXPENSE",
            expenseKind: "FIXED",
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            accountId,
            type: "INCOME",
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
      ])

    const totals = {
      month,
      year,
      totalVariableExpenses: totalVariableExpenses._sum.amount ?? 0,
      totalFixedExpenses: totalFixedExpenses._sum.amount ?? 0,
      totalIncomes: totalIncomes._sum.amount ?? 0,
    }

    const snapshot = await this.prisma.snapshot.upsert({
      where: { accountMemberId },
      create: {
        accountMemberId,
        ...totals,
      },
      update: totals,
    })

    return snapshot
  }
}
