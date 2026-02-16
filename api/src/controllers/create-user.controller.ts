import { Body, ConflictException, Controller, HttpCode, Post } from '@nestjs/common';
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

        await this.prisma.user.create({
            data: {
                name,
                email,
                password,
            }
        })
    }
}