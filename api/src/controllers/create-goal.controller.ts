import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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
    async handle(@Body() body: CreateGoalBodySchema) {
        // const goal = await this.prisma.goal.create({
        //     data: {
        //         title: 'Comprar um carro',
        //         targetAmount: 20000,
        //         currentAmount: 0,
        //     },
        // })

        return 'Goal created'
    }
}