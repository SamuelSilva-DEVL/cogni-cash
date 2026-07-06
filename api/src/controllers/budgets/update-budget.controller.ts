import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { RolesGuard } from "@/auth/roles.guard"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { WRITE_STRUCTURE_ROLES } from "@/auth/account-member-role"
import { type UserPayload } from "@/auth/jwt.strategy"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import { AccountContextService } from "@/services/account-context.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger"
import z from "zod"

const updateBudgetBodySchema = z.object({
  limit: z.number().positive("O limite deve ser maior que zero"),
})

type UpdateBudgetBodySchema = z.infer<typeof updateBudgetBodySchema>

const bodyValidationPipe = new ZodValidationPipe(updateBudgetBodySchema)

@ApiTags("Budgets")
@ApiBearerAuth()
@Controller("/budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateBudgetController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Patch(":id")
  @RequireRoles(...WRITE_STRUCTURE_ROLES)
  @ApiOperation({ summary: "Atualizar limite de gasto" })
  @ApiBody({
    schema: { example: { limit: 900 } },
  })
  @ApiResponse({ status: 200, description: "Limite atualizado com sucesso" })
  @ApiResponse({ status: 404, description: "Orçamento não encontrado" })
  async update(
    @Param("id") id: string,
    @Body(bodyValidationPipe) body: UpdateBudgetBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const context = await this.accountContext.resolve(user)

    const existing = await this.prisma.budget.findFirst({
      where: {
        id,
        accountId: context.accountId,
      },
      include: {
        category: true,
      },
    })

    if (!existing) {
      throw new NotFoundException("Orçamento não encontrado")
    }

    const budget = await this.prisma.budget.update({
      where: { id },
      data: { limit: body.limit },
    })

    return {
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: existing.category.name,
      limit: Number(budget.limit),
      month: budget.month,
      year: budget.year,
    }
  }
}
