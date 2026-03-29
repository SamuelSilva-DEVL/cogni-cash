import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger"
import z from "zod"

const fetchTransactionQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1)),
})

type FetchTransactionQuerySchema = z.infer<typeof fetchTransactionQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchTransactionQuerySchema)

@ApiTags("Transactions")
@ApiBearerAuth()
@Controller("/transactions")
@UseGuards(JwtAuthGuard)
export class FetchTransactionsByTypeController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Buscar transações por tipo (INCOME ou EXPENSE)" })
  @ApiQuery({
    name: "type",
    required: true,
    enum: ["INCOME", "EXPENSE"],
    description: "Tipo de transação a buscar",
    example: "EXPENSE",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número da página (padrão: 1)",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Transações retornadas com sucesso",
    schema: {
      example: {
        transactions: [
          {
            id: "txn_123",
            description: "Compras no supermercado",
            amount: "150.50",
            date: "2026-03-28T14:30:00Z",
            type: "EXPENSE",
            categoryName: "Alimentação",
            source: null,
            createdAt: "2026-03-28T14:30:00Z",
          },
        ],
        total: 42,
        page: 1,
        pageSize: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({
    status: 400,
    description: "Tipo de transação inválido",
  })
  async fetchByType(
    @Query(queryValidationPipe) query: FetchTransactionQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { type, page } = query
    const perPage = 10
    const prisma = this.prisma as any

    // Buscar a conta do usuário
    const membership = await prisma.accountMember.findFirst({
      where: {
        userId: user.userId,
      },
      select: {
        accountId: true,
      },
    })

    if (!membership) {
      throw new UnauthorizedException("Usuário sem conta vinculada")
    }

    const accountId = membership.accountId

    // Contar total de transações
    const total = await prisma.transaction.count({
      where: {
        accountId,
        type,
      },
    })

    // Buscar transações paginadas
    const transactions = await prisma.transaction.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      where: {
        accountId,
        type,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return {
      transactions: transactions.map((txn: any) => ({
        id: txn.id,
        description: txn.description,
        amount: txn.amount.toString(),
        date: txn.date.toISOString(),
        type: txn.type,
        categoryName: txn.category?.name || null,
        source: txn.source,
        createdAt: txn.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: perPage,
    }
  }
}
