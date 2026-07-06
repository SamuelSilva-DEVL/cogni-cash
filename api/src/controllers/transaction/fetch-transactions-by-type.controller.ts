import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import { AccountContextService } from "@/services/account-context.service"
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
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Buscar transações por tipo (INCOME ou EXPENSE)" })
  @ApiQuery({
    name: "type",
    required: true,
    enum: ["INCOME", "EXPENSE"],
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Transações retornadas com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async fetchByType(
    @Query(queryValidationPipe) query: FetchTransactionQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { type, page } = query
    const perPage = 10
    const context = await this.accountContext.resolve(user)

    const total = await this.prisma.transaction.count({
      where: {
        accountId: context.accountId,
        type,
      },
    })

    const transactions = await this.prisma.transaction.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      where: {
        accountId: context.accountId,
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
      transactions: transactions.map((txn) => ({
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
