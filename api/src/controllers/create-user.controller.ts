import { Body, ConflictException, Controller, HttpCode, Post } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('/users')
export class CreateUserController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    @HttpCode(201)
    async createUser(@Body() body: any) {
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