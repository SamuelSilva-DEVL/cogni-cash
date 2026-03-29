import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  HttpCode,
  BadRequestException,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { type UserPayload } from "@/auth/jwt.strategy"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
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
@UseGuards(JwtAuthGuard)
export class CreateTransactionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Criar nova transação" })
  @ApiBody({
    description: "Dados para criar uma nova transação",
    schema: {
      example: {
        description: "Salário do mês",
        amount: 5000,
        date: "2026-03-29T10:00:00Z",
        type: "INCOME",
        categoryName: "Salário",
        source: "Trabalho",
      },
      properties: {
        description: {
          type: "string",
          description: "Descrição da transação",
        },
        amount: {
          type: "number",
          description: "Valor da transação",
        },
        date: {
          type: "string",
          description: "Data da transação (ISO 8601)",
        },
        type: {
          type: "string",
          enum: ["INCOME", "EXPENSE"],
          description: "Tipo de transação",
        },
        categoryName: {
          type: "string",
          description: "Nome da categoria (será criada se não existir)",
        },
        source: {
          type: "string",
          description: "Origem da transação (opcional)",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Transação criada com sucesso",
    schema: {
      example: {
        id: "txn_123",
        description: "Salário do mês",
        amount: "5000.00",
        date: "2026-03-29T10:00:00Z",
        type: "INCOME",
        categoryName: "Salário",
        source: "Trabalho",
        createdAt: "2026-03-29T10:00:00Z",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
  })
  async create(
    @Body(bodyValidationPipe) body: CreateTransactionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { description, amount, date, type, categoryName, source } = body
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

    let categoryId: string | null = null

    // Se uma categoria foi informada, buscar ou criar
    if (categoryName) {
      let category = await prisma.category.findFirst({
        where: {
          name: categoryName,
          accountId,
        },
      })

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            accountId,
          },
        })
      }

      categoryId = category.id
    }

    // Criar a transação
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        date: new Date(date),
        type,
        source: source || null,
        accountId,
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
