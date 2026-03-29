import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaService } from "./prisma/prisma.service"
import { CreateUserController } from "./controllers/user/create-user.controller"
import { envSchema } from "./env"
import { AuthModule } from "./auth/auth.module"
import { AuthenticateController } from "./controllers/auth/authenticate.controller"
import { CreateGoalController } from "./controllers/goals/create-goal.controller"
import { FetchListGoalsController } from "./controllers/goals/fetch-list-goals.controller"
import { CreateTransactionController } from "./controllers/transaction/create-transaction.controller"
import { FetchTransactionsByTypeController } from "./controllers/transaction/fetch-transactions-by-type.controller"
import { CreateCategoryController } from "./controllers/categories/create-category.controller"
import { ListCategoriesController } from "./controllers/categories/list-categories.controller"

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateUserController,
    AuthenticateController,
    CreateGoalController,
    FetchListGoalsController,
    CreateTransactionController,
    FetchTransactionsByTypeController,
    CreateCategoryController,
    ListCategoriesController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
