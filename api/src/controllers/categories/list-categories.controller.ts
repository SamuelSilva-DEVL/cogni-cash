import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { type UserPayload } from "@/auth/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"
import { AccountContextService } from "@/services/account-context.service"
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
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar categorias da conta" })
  @ApiResponse({ status: 200, description: "Categorias listadas com sucesso" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  async list(@CurrentUser() user: UserPayload) {
    const context = await this.accountContext.resolve(user)

    const categories = await this.prisma.category.findMany({
      where: {
        accountId: context.accountId,
      },
      orderBy: {
        name: "asc",
      },
    })

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        createdAt: cat.createdAt.toISOString(),
      })),
      total: categories.length,
    }
  }
}
