import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { READ_ROLES } from "@/auth/account-member-role"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { RolesGuard } from "@/auth/roles.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { AccountContextService } from "@/services/account-context.service"
import { AnalystService } from "@/services/analyst/analyst.service"
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import z from "zod"

const snapshotQuerySchema = z.object({
  period: z.enum(["month", "quarter", "year"]).default("month"),
})

type SnapshotQuery = z.infer<typeof snapshotQuerySchema>

const queryValidationPipe = new ZodValidationPipe(snapshotQuerySchema)

@ApiTags("Analyst")
@ApiBearerAuth()
@Controller("/analyst")
@UseGuards(JwtAuthGuard, RolesGuard)
export class FetchAnalystSnapshotController {
  constructor(
    private analyst: AnalystService,
    private accountContext: AccountContextService,
  ) {}

  @Get("/snapshot")
  @RequireRoles(...READ_ROLES)
  @ApiOperation({ summary: "Totais de receitas e despesas do período para o analista" })
  @ApiQuery({ name: "period", required: false, enum: ["month", "quarter", "year"] })
  @ApiResponse({ status: 200, description: "Retrato do período" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async handle(
    @Query(queryValidationPipe) query: SnapshotQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const context = await this.accountContext.resolve(user)

    return this.analyst.snapshot(context.accountId, query.period)
  }
}
