import { Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { READ_ROLES } from "@/auth/account-member-role";
import { CurrentUser } from "@/auth/current-user-decorator";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { type UserPayload } from "@/auth/jwt.strategy";
import { RequireRoles } from "@/auth/require-roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { PrismaService } from "@/prisma/prisma.service";
import { AccountContextService } from "@/services/account-context.service";
import { GetCurrentMonthDataService } from "@/services/metrics/get-current-month-data";
import { SnapshotService } from "@/services/metrics/snapshot.service";
import { Cron } from "@nestjs/schedule";

const calculateMetric = (previous: number, current: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

const metricLabel = (value: number) => {
  if (!Number.isFinite(value) || value === 0) return "";
  return `${value.toFixed(2)}% em relação ao mês anterior`;
}

@ApiTags("Metrics")
@ApiBearerAuth()
@Controller("/metrics")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlySummaryController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
    private currentMonthData: GetCurrentMonthDataService,
  ) {}

  @Post('/create-monthly-summary')
  @ApiOperation({ summary: "Create monthly summary - Teste service job" })
  @HttpCode(200)
  @ApiResponse({ status: 200, description: "Snapshot do mês criado com sucesso" })
  async createMonthlySummary(@CurrentUser() user: UserPayload) {
    const account = await this.accountContext.resolve(user);
    const accountId = account.accountId;
    const accountMemberId = account.membershipId;

    const snapshotService = new SnapshotService(this.prisma);
    await snapshotService.createSnapshot(accountId, accountMemberId);

    return {
      message: "Snapshot do mês criado com sucesso",
    };
  }

  @Cron('0 0 1 * *', {timeZone: 'America/Sao_Paulo', name: 'Criar snapshot do mês'})
  async createMonthlySummaryCron(@CurrentUser() user: UserPayload) {
    const account = await this.accountContext.resolve(user);
    const accountId = account.accountId;
    const accountMemberId = account.membershipId;

    const snapshotService = new SnapshotService(this.prisma);
    await snapshotService.createSnapshot(accountId, accountMemberId);
  }

  @Get("/monthly-summary")
  @ApiOperation({ summary: "Get monthly summary" })
  @RequireRoles(...READ_ROLES)
  @ApiResponse({ status: 200, description: "Monthly summary" })
  async gerMonthlySummary(@CurrentUser() user: UserPayload) {
    const account = await this.accountContext.resolve(user);
    const accountId = account.accountId;
    const accountMemberId = account.membershipId;

    const snapshots = await this.prisma.snapshot.findUnique({
      where: {
        accountMemberId,
      }
    });

    const currentMonthData = await this.currentMonthData.getCurrentMonthData(accountId);

    const totalVariableExpensesSnapshot = Number(snapshots?.totalVariableExpenses ?? 0);
    const metricVariableExpenses = calculateMetric(totalVariableExpensesSnapshot, currentMonthData.totalVariableExpenses);
    const totalFixedExpensesSnapshot = Number(snapshots?.totalFixedExpenses ?? 0);
    const metricFixedExpenses = calculateMetric(totalFixedExpensesSnapshot, currentMonthData.totalFixedExpenses);
    const totalIncomesSnapshot = Number(snapshots?.totalIncomes ?? 0);
    const metricIncomes = calculateMetric(totalIncomesSnapshot, currentMonthData.totalIncomes);

    const totalRestSnapshot = (totalIncomesSnapshot) - ((totalVariableExpensesSnapshot) + (totalFixedExpensesSnapshot));
    const metricRest = calculateMetric(totalRestSnapshot, currentMonthData.totalRest);

    return {
      variableExpenses: {
        total: currentMonthData.totalVariableExpenses,
        percentage: metricVariableExpenses,
        metrics: metricLabel(metricVariableExpenses),
      },
      fixedExpenses: {
        total: currentMonthData.totalFixedExpenses,
        percentage: metricFixedExpenses,
        metrics: metricLabel(metricFixedExpenses),
      },
      incomes: {
        total: currentMonthData.totalIncomes,
        percentage: metricIncomes,
        metrics: metricLabel(metricIncomes),
      },
      rest: {
        total: currentMonthData.totalRest,
        percentage: metricRest,
        metrics: metricLabel(metricRest),
      },
    }
  }
}
