import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from "@nestjs/common"
import { hash } from "bcryptjs"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger"
import z from "zod"

const createUserSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.email("O email deve ser válido"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
})

type CreateUserSchema = z.infer<typeof createUserSchema>

@ApiTags("Users")
@Controller("/users")
export class CreateUserController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Criar novo usuário" })
  @ApiBody({
    description: "Dados para criar novo usuário",
    schema: {
      example: {
        name: "João Silva",
        email: "joao@example.com",
        password: "senha123",
      },
      properties: {
        name: { type: "string", description: "Nome completo do usuário" },
        email: { type: "string", description: "Email único do usuário" },
        password: {
          type: "string",
          description: "Senha com mínimo 6 caracteres",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Usuário criado com sucesso",
    schema: {
      example: {
        id: "user_123",
        name: "João Silva",
        email: "joao@example.com",
      },
    },
  })
  @ApiResponse({ status: 409, description: "Usuário com este email já existe" })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: CreateUserSchema) {
    const { name, email, password } = body
    const prisma = this.prisma as any

    const hasExistingUserWithEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (hasExistingUserWithEmail) {
      throw new ConflictException("Um usuário com esse email já existe")
    }

    const hashedPassword = await hash(password, 8)

    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      const account = await tx.account.create({
        data: {
          name: `Conta de ${name}`,
        },
      })

      await tx.accountMember.create({
        data: {
          userId: user.id,
          accountId: account.id,
          role: "owner",
        },
      })
    })
  }
}
