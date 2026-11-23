import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { PrismaService } from "@/prisma/prisma.service";
import { AccountContextService } from "@/services/account-context.service";
import { CurrentUser } from "@/auth/current-user-decorator";
import { NotFoundException } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { type UserPayload } from "@/auth/jwt.strategy";

const updateGoalBodySchema = z.object({
  title: z.string().default(""),
  targetAmount: z.number().default(0),
  currentAmount: z.number().optional(),
  deadline: z.string().optional(),
});

type UpdateGoalBodySchemaType = z.infer<typeof updateGoalBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(updateGoalBodySchema);

@ApiTags("Goals")
@ApiBearerAuth()
@Controller("/goals")
@UseGuards(JwtAuthGuard)
export class ManageGoalByIdController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Patch("/goal/:id")
  @ApiOperation({ summary: "Atualizar meta financeira por ID" })
  @ApiParam({
    name: "id",
    description: "ID da meta financeira",
    type: String,
  })
  @ApiBody({
    description: "Dados para atualizar a meta financeira",
    schema: {
      example: {
        title: "Fundo de emergência",
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: "2026-12-31",
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Meta financeira atualizada com sucesso",
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 404, description: "Meta financeira não encontrada" })
  async updateById(
    @Param("id") id: string,
    @Body(bodyValidationPipe) body: UpdateGoalBodySchemaType,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, targetAmount, currentAmount, deadline } = body;
    const context = await this.accountContext.resolve(user);

    const goal = await this.prisma.goal.findUnique({
      where: { id, accountId: context.accountId },
    });

    if (!goal) {
      throw new NotFoundException("Meta financeira não encontrada");
    }

    await this.prisma.goal.update({
      where: { id, accountId: context.accountId },
      data: {
        title: String(title),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    return { message: "Meta financeira atualizada com sucesso" };
  }

  @Delete("/goal/:id")
  @ApiOperation({ summary: "Deletar meta financeira por ID" })
  @ApiParam({
    name: "id",
    description: "ID da meta financeira",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Meta financeira deletada com sucesso",
  })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 404, description: "Meta financeira não encontrada" })
  async deleteById(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    const context = await this.accountContext.resolve(user);

    const goal = await this.prisma.goal.findUnique({
      where: { id, accountId: context.accountId },
    });

    if (!goal) {
      throw new NotFoundException("Meta financeira não encontrada");
    }

    await this.prisma.goal.delete({
      where: { id, accountId: context.accountId },
    });

    return { message: "Meta financeira deletada com sucesso" };
  }
}
