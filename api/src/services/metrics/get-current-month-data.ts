import { PrismaService } from "@/prisma/prisma.service";
import { getCurrentMonthDateRange } from "@/utils/timezone-date";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetCurrentMonthDataService {
  constructor(private prisma: PrismaService) {}

  async getCurrentMonthData(accountId: string) {
    const { periodStart, periodEnd } = getCurrentMonthDateRange();

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
      ]);

    const totalRest = Number(totalIncomes._sum.amount ?? 0) - (Number(totalVariableExpenses._sum.amount ?? 0) + Number(totalFixedExpenses._sum.amount ?? 0));

    return {
      totalVariableExpenses: Number(totalVariableExpenses._sum.amount ?? 0),
      totalFixedExpenses: Number(totalFixedExpenses._sum.amount ?? 0),
      totalIncomes: Number(totalIncomes._sum.amount ?? 0),
      totalRest: totalRest,
    };
  }
}