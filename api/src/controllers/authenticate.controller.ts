import { Body, ConflictException, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import z from 'zod';

// const createUserSchema = z.object({
//     name: z.string().min(1, 'O nome é obrigatório'),
//     email: z.email('O email deve ser válido'),
//     password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
// })

// type CreateUserSchema = z.infer<typeof createUserSchema>

@Controller('/sessions')
export class AuthenticateController {
    constructor(
        private jwt: JwtService
    ) {}

    @Post()
    async handle(){
        const token = this.jwt.sign({ userId: 1 })

        return token
    }
}