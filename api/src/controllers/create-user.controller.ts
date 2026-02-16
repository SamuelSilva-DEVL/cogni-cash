import { Body, ConflictException, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import z from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.email('O email deve ser válido'),
    password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
})

type CreateUserSchema = z.infer<typeof createUserSchema>

@Controller('/users')
export class CreateUserController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createUserSchema))
    async createUser(@Body() body: CreateUserSchema) {
        const { name, email, password } = body

        const hasExistingUserWithEmail = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (hasExistingUserWithEmail) {
            throw new ConflictException('Um usuário com esse email já existe')
        }

        const hashedPassword = await hash(password, 8)

        await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })
    }
}