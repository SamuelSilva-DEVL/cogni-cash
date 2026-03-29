import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  HttpCode,
  ConflictException,
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

const createCategoryBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
})

type CreateCategoryBodySchema = z.infer<typeof createCategoryBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createCategoryBodySchema)

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("/categories")
@UseGuards(JwtAuthGuard)
export class CreateCategoryController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Criar nova categoria" })
  @ApiBody({
    description: "Dados para criar uma nova categoria",
    schema: {
      example: {
        name: "Alimentação",
      },
      properties: {
        name: {
          type: "string",
          description: "Nome da categoria",
          minLength: 1,
          maxLength: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Categoria criada com sucesso",
    schema: {
      example: {
        id: "cat_123",
        name: "Alimentação",
        createdAt: "2026-03-29T10:00:00Z",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({
    status: 409,
    description: "Categoria com este nome já existe para esta conta",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
  })
  async create(
    @Body(bodyValidationPipe) body: CreateCategoryBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name } = body
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

    // Verificar se categoria já existe nesta conta
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        accountId,
      },
    })

    if (existingCategory) {
      throw new ConflictException(
        "Uma categoria com este nome já existe para sua conta",
      )
    }

    // Criar a categoria
    const category = await prisma.category.create({
      data: {
        name,
        accountId,
      },
    })

    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt.toISOString(),
    }
  }
}
