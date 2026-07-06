import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { RolesGuard } from "@/auth/roles.guard"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { WRITE_STRUCTURE_ROLES } from "@/auth/account-member-role"
import { type UserPayload } from "@/auth/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"
import { AccountContextService } from "@/services/account-context.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger"

@ApiTags("Budgets")
@ApiBearerAuth()
@Controller("/budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteBudgetController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Delete(":id")
  @RequireRoles(...WRITE_STRUCTURE_ROLES)
  @HttpCode(204)
  @ApiOperation({ summary: "Remover limite de gasto" })
  @ApiResponse({ status: 204, description: "Orçamento removido com sucesso" })
  @ApiResponse({ status: 404, description: "Orçamento não encontrado" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload,
  ) {
    const context = await this.accountContext.resolve(user)

    const existing = await this.prisma.budget.findFirst({
      where: {
        id,
        accountId: context.accountId,
      },
    })

    if (!existing) {
      throw new NotFoundException("Orçamento não encontrado")
    }

    await this.prisma.budget.delete({ where: { id } })
  }
}
