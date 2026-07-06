import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { type UserPayload } from "@/auth/jwt.strategy"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { AccountContextService } from "@/services/account-context.service"
import { BudgetQueryService } from "@/services/budget-query.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger"
import z from "zod"

const listBudgetsQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : new Date().getMonth() + 1))
    .pipe(z.number().int().min(1).max(12)),
  year: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : new Date().getFullYear()))
    .pipe(z.number().int().min(2000).max(2100)),
})

type ListBudgetsQuerySchema = z.infer<typeof listBudgetsQuerySchema>

const queryValidationPipe = new ZodValidationPipe(listBudgetsQuerySchema)

@ApiTags("Budgets")
@ApiBearerAuth()
@Controller("/budgets")
@UseGuards(JwtAuthGuard)
export class ListBudgetsController {
  constructor(
    private accountContext: AccountContextService,
    private budgetQuery: BudgetQueryService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar limites de gasto por categoria no mês" })
  @ApiQuery({ name: "month", required: false, type: Number, example: 7 })
  @ApiQuery({ name: "year", required: false, type: Number, example: 2026 })
  @ApiResponse({ status: 200, description: "Limites retornados com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async list(
    @Query(queryValidationPipe) query: ListBudgetsQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { month, year } = query
    const context = await this.accountContext.resolve(user)

    return this.budgetQuery.listWithProgress(
      context.accountId,
      month,
      year,
    )
  }
}
