import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from "src/prisma/prisma.service"
import z from 'zod'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller("/goals")
@UseGuards(JwtAuthGuard)
export class FetchListGoalsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
    const perPage = 10

    const goals = await this.prisma.goal.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: "asc",
      },
    })

    return {
      goals,
    }
  }
}
