import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaService } from "./prisma/prisma.service"
import { CreateUserController } from "./controllers/user/create-user.controller"
import { envSchema } from "./env"
import { AuthModule } from "./auth/auth.module"
import { AuthenticateController } from "./controllers/auth/authenticate.controller"
import { CreateGoalController } from "./controllers/goals/create-goal.controller"
import { FetchListGoalsController } from "./controllers/goals/fetch-list-goals.controller"
import { ManageGoalByIdController } from "./controllers/goals/manage-goal-by-id.controller"
import { CreateTransactionController } from "./controllers/transaction/create-transaction.controller"
import { FetchTransactionsByTypeController } from "./controllers/transaction/fetch-transactions-by-type.controller"
import { CreateCategoryController } from "./controllers/categories/create-category.controller"
import { ListCategoriesController } from "./controllers/categories/list-categories.controller"
import {
  AcceptInviteController,
  InviteMemberController,
  ListMembersController,
  RemoveMemberController,
  UpdateMemberController,
} from "./controllers/accounts/account-members.controller"
import { ListBudgetsController } from "./controllers/budgets/list-budgets.controller"
import { CreateBudgetController } from "./controllers/budgets/create-budget.controller"
import { UpdateBudgetController } from "./controllers/budgets/update-budget.controller"
import { DeleteBudgetController } from "./controllers/budgets/delete-budget.controller"
import { AskAnalystController } from "./controllers/analyst/ask-analyst.controller"
import { FetchAnalystSnapshotController } from "./controllers/analyst/fetch-analyst-snapshot.controller"
import { AccountContextService } from "./services/account-context.service"
import { AnalystLlmClient } from "./services/analyst/analyst-llm.client"
import { AnalystService } from "./services/analyst/analyst.service"
import { BudgetQueryService } from "./services/budget-query.service"
import { RolesGuard } from "./auth/roles.guard"
import { ScheduleModule } from "@nestjs/schedule"
import { SnapshotService } from "./services/metrics/snapshot.service"
import { GetCurrentMonthDataService } from "./services/metrics/get-current-month-data"
import { MonthlySummaryController } from "./controllers/metrics/monthly-summary-controller"

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    CreateUserController,
    AuthenticateController,
    CreateGoalController,
    FetchListGoalsController,
    ManageGoalByIdController,
    CreateTransactionController,
    FetchTransactionsByTypeController,
    CreateCategoryController,
    ListCategoriesController,
    ListBudgetsController,
    CreateBudgetController,
    UpdateBudgetController,
    DeleteBudgetController,
    InviteMemberController,
    AcceptInviteController,
    ListMembersController,
    UpdateMemberController,
    RemoveMemberController,
    FetchAnalystSnapshotController,
    AskAnalystController,
    MonthlySummaryController,
  ],
  providers: [
    PrismaService,
    AccountContextService,
    BudgetQueryService,
    RolesGuard,
    AnalystLlmClient,
    AnalystService,
    SnapshotService,
    GetCurrentMonthDataService,
  ],
})
export class AppModule {}
