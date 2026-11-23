import {
  Controller,
  Get,
  NotFoundException,
  Param,
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
  ApiParam,
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
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar metas financeiras do usuário" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número da página (padrão: 1)",
    example: 1,
  })
  @ApiResponse({ status: 200, description: "Lista de metas retornada com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async handle(
    @Query("page", queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const perPage = 10
    const context = await this.accountContext.resolve(user)

    const goals = await this.prisma.goal.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      where: {
        accountId: context.accountId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return {
      goals,
    }
  }


  @Get("/goal/:id")
  @ApiOperation({ summary: "Buscar meta financeira por ID" })
  @ApiParam({
    name: "id",
    description: "ID da meta financeira",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Meta financeira encontrada com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 404, description: "Meta financeira não encontrada" })
  async findById(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    const context = await this.accountContext.resolve(user)
    
    const goal = await this.prisma.goal.findUnique({
      where: { id, accountId: context.accountId },
    })

    if (!goal) {
      throw new NotFoundException("Meta financeira não encontrada")
    }
    
    return {
      goal,
    }
  }
}
