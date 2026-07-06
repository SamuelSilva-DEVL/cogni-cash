import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
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

const createBudgetBodySchema = z
  .object({
    categoryId: z.uuid("Categoria inválida").optional(),
    categoryName: z.string().min(1, "Nome da categoria é obrigatório").optional(),
    limit: z.number().positive("O limite deve ser maior que zero"),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
  })
  .refine((data) => data.categoryId || data.categoryName?.trim(), {
    message: "Informe categoryId ou categoryName",
  })

type CreateBudgetBodySchema = z.infer<typeof createBudgetBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createBudgetBodySchema)

@ApiTags("Budgets")
@ApiBearerAuth()
@Controller("/budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateBudgetController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Post()
  @RequireRoles(...WRITE_STRUCTURE_ROLES)
  @HttpCode(201)
  @ApiOperation({ summary: "Criar limite de gasto por categoria no mês" })
  @ApiBody({
    schema: {
      example: {
        categoryName: "Alimentação",
        limit: 800,
        month: 7,
        year: 2026,
      },
    },
  })
  @ApiResponse({ status: 201, description: "Limite criado com sucesso" })
  @ApiResponse({
    status: 409,
    description: "Limite já existe para esta categoria no mês",
  })
  async create(
    @Body(bodyValidationPipe) body: CreateBudgetBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { categoryId, categoryName, limit, month, year } = body
    const context = await this.accountContext.resolve(user)

    const category = await this.resolveCategory(
      context.accountId,
      categoryId,
      categoryName,
    )

    const budget = await this.prisma.budget
      .create({
        data: {
          limit,
          month,
          year,
          accountId: context.accountId,
          categoryId: category.id,
        },
      })
      .catch((error) => {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Já existe um limite para esta categoria neste mês",
          )
        }
        throw error
      })

    return {
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: category.name,
      limit: Number(budget.limit),
      month: budget.month,
      year: budget.year,
    }
  }

  private async resolveCategory(
    accountId: string,
    categoryId?: string,
    categoryName?: string,
  ) {
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, accountId },
      })

      if (!category) {
        throw new NotFoundException("Categoria não encontrada")
      }

      return category
    }

    const name = categoryName?.trim()

    if (!name) {
      throw new BadRequestException("Informe o nome da categoria")
    }

    const existing = await this.prisma.category.findFirst({
      where: { name, accountId },
    })

    if (existing) return existing

    return this.prisma.category.create({
      data: { name, accountId },
    })
  }
}
