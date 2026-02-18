import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type UserPayload } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import z from 'zod';

const createGoalBodySchema = z.object({
    title: z.string().default(''),
    targetAmount: z.number().default(0),
    currentAmount: z.number().optional(),
    deadline: z.string().optional()
})

type CreateGoalBodySchema = z.infer<typeof createGoalBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createGoalBodySchema)

@Controller('/goals')
@UseGuards(JwtAuthGuard)
export class CreateGoalController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    async handle(
        @Body(bodyValidationPipe) body: CreateGoalBodySchema,
        @CurrentUser() user: UserPayload
    ) {
        const {title, targetAmount, currentAmount, deadline} = body
        const {userId} = user
        const slug = this.convertSlug(title)
        
        await this.prisma.goal.create({
            data: {
                title,
                targetAmount,
                currentAmount,
                deadline: deadline ? new Date(deadline) : undefined,
                userId,
                slug: slug
            }
        })
        
        return { message: 'Goal created successfully' }
    }

    private convertSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
}