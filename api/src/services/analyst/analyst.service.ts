import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import {
  AnalystLlmClient,
  userFacingAnalystError,
  type AnalystChatTurn,
} from "./analyst-llm.client"
import {
  buildBriefing,
  buildSnapshot,
  buildSystemPrompt,
  type AnalystSnapshot,
  type BriefingBudget,
  type BriefingGoal,
  type BriefingTransaction,
  type CategoryBucket,
} from "./briefing"
import { moneyToCents } from "./money"
import {
  isMonthInsideRange,
  resolvePeriodRange,
  type AnalystPeriod,
  type PeriodRange,
} from "./period"

const NOT_CONFIGURED =
  "O analista ainda não está ativo. Configure AI_API_KEY na API para ele responder com base nas receitas e despesas."

const UPSTREAM =
  "Não consegui consultar o analista agora. Tente de novo em instantes."

export type AnalystSnapshotResponse = AnalystSnapshot & {
  ready: boolean
}

@Injectable()
export class AnalystService {
  constructor(
    private prisma: PrismaService,
    private llm: AnalystLlmClient,
  ) {}

  async snapshot(accountId: string, period: AnalystPeriod): Promise<AnalystSnapshotResponse> {
    const loaded = await this.loadCore(accountId, period)

    return {
      ...loaded.snapshot,
      ready: this.llm.isConfigured(),
    }
  }

  async reply(
    accountId: string,
    input: {
      message: string
      period: AnalystPeriod
      history: AnalystChatTurn[]
    },
  ) {
    if (!this.llm.isConfigured()) {
      throw new ServiceUnavailableException(NOT_CONFIGURED)
    }

    const loaded = await this.loadCore(accountId, input.period)
    const [budgets, goals, recent] = await Promise.all([
      this.loadBudgets(accountId, loaded.range),
      this.loadGoals(accountId),
      this.loadRecent(accountId, loaded.range),
    ])

    let reply: string
    try {
      reply = await this.llm.complete(
        buildSystemPrompt(
          buildBriefing({
            snapshot: loaded.snapshot,
            incomeCount: loaded.incomeCount,
            expenseCount: loaded.expenseCount,
            budgets,
            goals,
            recent,
          }),
        ),
        [...input.history, { role: "user", content: input.message }],
      )
    } catch (error) {
      throw new BadGatewayException(userFacingAnalystError(error) ?? UPSTREAM)
    }

    return {
      reply,
      snapshot: {
        ...loaded.snapshot,
        ready: true,
      } satisfies AnalystSnapshotResponse,
    }
  }

  private async loadCore(accountId: string, period: AnalystPeriod) {
    const range = resolvePeriodRange(period)
    const where = {
      accountId,
      date: {
        gte: range.from,
        lte: range.to,
      },
    }

    const [income, expense, grouped] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["type", "categoryId"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ])

    const categoryIds = grouped
      .map((row) => row.categoryId)
      .filter((id): id is string => Boolean(id))

    const categories =
      categoryIds.length === 0
        ? []
        : await this.prisma.category.findMany({
            where: {
              id: { in: categoryIds },
              accountId,
            },
            select: { id: true, name: true },
          })

    const names = new Map(categories.map((category) => [category.id, category.name]))
    const buckets: CategoryBucket[] = grouped.map((row) => ({
      type: row.type,
      name: row.categoryId ? (names.get(row.categoryId) ?? "Sem categoria") : "Sem categoria",
      totalCents: moneyToCents(row._sum.amount),
      count: row._count._all,
    }))

    return {
      range,
      incomeCount: income._count._all,
      expenseCount: expense._count._all,
      snapshot: buildSnapshot({
        range,
        incomeCents: moneyToCents(income._sum.amount),
        expenseCents: moneyToCents(expense._sum.amount),
        transactionCount: income._count._all + expense._count._all,
        categories: buckets,
      }),
    }
  }

  private async loadBudgets(accountId: string, range: PeriodRange): Promise<BriefingBudget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { accountId },
      include: {
        category: { select: { name: true } },
      },
    })

    return budgets
      .filter((budget) => isMonthInsideRange(range, budget.year, budget.month))
      .map((budget) => ({
        category: budget.category.name,
        month: budget.month,
        year: budget.year,
        limitCents: moneyToCents(budget.limit),
      }))
  }

  private async loadGoals(accountId: string): Promise<BriefingGoal[]> {
    const goals = await this.prisma.goal.findMany({
      where: { accountId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        title: true,
        targetAmount: true,
        currentAmount: true,
      },
    })

    return goals.map((goal) => ({
      title: goal.title,
      targetCents: moneyToCents(goal.targetAmount),
      currentCents: moneyToCents(goal.currentAmount),
    }))
  }

  private async loadRecent(
    accountId: string,
    range: PeriodRange,
  ): Promise<BriefingTransaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        date: {
          gte: range.from,
          lte: range.to,
        },
      },
      orderBy: { date: "desc" },
      take: 25,
      include: {
        category: { select: { name: true } },
      },
    })

    return transactions.map((transaction) => ({
      date: transaction.date,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category?.name ?? null,
      amountCents: moneyToCents(transaction.amount),
    }))
  }
}
