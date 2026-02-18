import { Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type UserPayload } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import z from 'zod';

const createGoalBodySchema = z.object({
    title: z.string(),
    targetAmount: z.number(),
    currentAmount: z.number(),
})

type CreateGoalBodySchema = z.infer<typeof createGoalBodySchema>

@Controller('/goals')
@UseGuards(JwtAuthGuard)
export class CreateGoalController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    async handle(@CurrentUser() user: UserPayload) {
        console.log(user.userId)
        return 'Goal created'
    }
}