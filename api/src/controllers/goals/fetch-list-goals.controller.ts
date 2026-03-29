import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "src/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger"
import z from "zod"

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@ApiTags("Goals")
@ApiBearerAuth()
@Controller("/goals")
@UseGuards(JwtAuthGuard)
export class FetchListGoalsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Listar metas financeiras do usuário" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número da página (padrão: 1)",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Lista de metas retornada com sucesso",
    schema: {
      example: {
        goals: [
          {
            id: "goal_123",
            title: "Fundo de emergência",
            targetAmount: 10000,
            currentAmount: 2500,
            slug: "fundo-de-emergencia",
          },
        ],
        total: 15,
        page: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async handle(
    @Query("page", queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const perPage = 10
    const membership = await this.prisma.accountMember.findFirst({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        accountId: true,
      },
    })

    if (!membership) {
      throw new UnauthorizedException("Usuário sem conta vinculada")
    }

    const goals = await this.prisma.goal.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      where: {
        accountId: membership.accountId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return {
      goals,
    }
  }
}
