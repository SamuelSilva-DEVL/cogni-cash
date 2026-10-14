import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common"
import { CurrentUser } from "@/auth/current-user-decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { READ_ROLES } from "@/auth/account-member-role"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { RolesGuard } from "@/auth/roles.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { AccountContextService } from "@/services/account-context.service"
import { AnalystService } from "@/services/analyst/analyst.service"
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import z from "zod"

const askAnalystBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Escreva o que você quer saber.")
    .max(1000, "A pergunta pode ter no máximo 1000 caracteres."),
  period: z.enum(["month", "quarter", "year"]).default("month"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .max(8)
    .default([]),
})

type AskAnalystBody = z.infer<typeof askAnalystBodySchema>

const bodyValidationPipe = new ZodValidationPipe(askAnalystBodySchema)

@ApiTags("Analyst")
@ApiBearerAuth()
@Controller("/analyst")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AskAnalystController {
  constructor(
    private analyst: AnalystService,
    private accountContext: AccountContextService,
  ) {}

  @Post("/messages")
  @HttpCode(200)
  @RequireRoles(...READ_ROLES)
  @ApiOperation({ summary: "Perguntar ao analista sobre receitas e despesas" })
  @ApiBody({
    schema: {
      example: {
        message: "A receita cobre as despesas deste mês?",
        period: "month",
        history: [],
      },
    },
  })
  @ApiResponse({ status: 200, description: "Resposta do analista" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 503, description: "Analista sem chave de IA" })
  async handle(
    @Body(bodyValidationPipe) body: AskAnalystBody,
    @CurrentUser() user: UserPayload,
  ) {
    const context = await this.accountContext.resolve(user)

    return this.analyst.reply(context.accountId, body)
  }
}
