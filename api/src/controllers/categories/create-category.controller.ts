import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  ConflictException,
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

const createCategoryBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
})

type CreateCategoryBodySchema = z.infer<typeof createCategoryBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createCategoryBodySchema)

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateCategoryController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Post()
  @RequireRoles(...WRITE_STRUCTURE_ROLES)
  @HttpCode(201)
  @ApiOperation({ summary: "Criar nova categoria" })
  @ApiBody({
    schema: { example: { name: "Alimentação" } },
  })
  @ApiResponse({ status: 201, description: "Categoria criada com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  @ApiResponse({
    status: 409,
    description: "Categoria com este nome já existe para esta conta",
  })
  async create(
    @Body(bodyValidationPipe) body: CreateCategoryBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name } = body
    const context = await this.accountContext.resolve(user)

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name,
        accountId: context.accountId,
      },
    })

    if (existingCategory) {
      throw new ConflictException(
        "Uma categoria com este nome já existe para sua conta",
      )
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        accountId: context.accountId,
      },
    })

    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt.toISOString(),
    }
  }
}
