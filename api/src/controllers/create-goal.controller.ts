import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { type UserPayload } from '@/auth/jwt.strategy';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
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
        const prisma = this.prisma as any

        const membership = await prisma.accountMember.findFirst({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                accountId: true,
            },
        })

        if (!membership) {
            throw new UnauthorizedException('Usuário sem conta vinculada')
        }
        
        await prisma.goal.create({
            data: {
                title,
                targetAmount,
                currentAmount,
                deadline: deadline ? new Date(deadline) : undefined,
                accountId: membership.accountId,
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