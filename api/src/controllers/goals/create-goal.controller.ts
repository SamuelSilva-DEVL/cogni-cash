import {
  Body,
  Controller,
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

const createGoalBodySchema = z.object({
  title: z.string().default(""),
  targetAmount: z.number().default(0),
  currentAmount: z.number().optional(),
  deadline: z.string().optional(),
})

type CreateGoalBodySchema = z.infer<typeof createGoalBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createGoalBodySchema)

@ApiTags("Goals")
@ApiBearerAuth()
@Controller("/goals")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateGoalController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Post()
  @RequireRoles(...WRITE_STRUCTURE_ROLES)
  @ApiOperation({ summary: "Criar nova meta financeira" })
  @ApiBody({
    description: "Dados para criar uma nova meta de economias",
    schema: {
      example: {
        title: "Fundo de emergência",
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: "2026-12-31",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Meta criada com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async handle(
    @Body(bodyValidationPipe) body: CreateGoalBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, targetAmount, currentAmount, deadline } = body
    const slug = this.convertSlug(title)
    const context = await this.accountContext.resolve(user)

    await this.prisma.goal.create({
      data: {
        title,
        targetAmount,
        currentAmount,
        deadline: deadline ? new Date(deadline) : undefined,
        accountId: context.accountId,
        slug,
      },
    })

    return { message: "Goal created successfully" }
  }

  private convertSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }
}
