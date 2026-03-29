import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { type UserPayload } from "@/auth/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger"

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("/categories")
@UseGuards(JwtAuthGuard)
export class ListCategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Listar categorias da conta" })
  @ApiResponse({
    status: 200,
    description: "Categorias listadas com sucesso",
    schema: {
      example: {
        categories: [
          {
            id: "cat_123",
            name: "Alimentação",
            createdAt: "2026-03-29T10:00:00Z",
          },
          {
            id: "cat_456",
            name: "Transporte",
            createdAt: "2026-03-28T14:30:00Z",
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async list(@CurrentUser() user: UserPayload) {
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

    // Buscar todas as categorias
    const categories = await prisma.category.findMany({
      where: {
        accountId,
      },
      orderBy: {
        name: "asc",
      },
    })

    return {
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        createdAt: cat.createdAt.toISOString(),
      })),
      total: categories.length,
    }
  }
}
