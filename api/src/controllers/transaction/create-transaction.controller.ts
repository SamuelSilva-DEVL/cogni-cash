import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { RolesGuard } from "@/auth/roles.guard"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { WRITE_FINANCE_ROLES } from "@/auth/account-member-role"
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

const createTransactionBodySchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().datetime("Data deve estar no formato ISO 8601"),
  type: z.enum(["INCOME", "EXPENSE"]).catch("EXPENSE"),
  categoryName: z.string().optional(),
  source: z.string().optional(),
})

type CreateTransactionBodySchema = z.infer<typeof createTransactionBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createTransactionBodySchema)

@ApiTags("Transactions")
@ApiBearerAuth()
@Controller("/transactions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateTransactionController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Post()
  @RequireRoles(...WRITE_FINANCE_ROLES)
  @HttpCode(201)
  @ApiOperation({ summary: "Criar nova transação" })
  @ApiBody({
    schema: {
      example: {
        description: "Salário do mês",
        amount: 5000,
        date: "2026-03-29T10:00:00Z",
        type: "INCOME",
        categoryName: "Salário",
        source: "Trabalho",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Transação criada com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async create(
    @Body(bodyValidationPipe) body: CreateTransactionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { description, amount, date, type, categoryName, source } = body
    const context = await this.accountContext.resolve(user)

    let categoryId: string | null = null

    if (categoryName) {
      let category = await this.prisma.category.findFirst({
        where: {
          name: categoryName,
          accountId: context.accountId,
        },
      })

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: categoryName,
            accountId: context.accountId,
          },
        })
      }

      categoryId = category.id
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        description,
        amount,
        date: new Date(date),
        type,
        source: source || null,
        accountId: context.accountId,
        categoryId,
        createdBy: user.userId,
      },
      include: {
        category: true,
      },
    })

    return {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: transaction.date.toISOString(),
      type: transaction.type,
      categoryName: transaction.category?.name || null,
      source: transaction.source,
      createdAt: transaction.createdAt.toISOString(),
    }
  }
}
