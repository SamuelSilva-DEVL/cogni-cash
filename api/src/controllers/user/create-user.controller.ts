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
import { AccountMemberRole } from "@/generated/prisma/client"
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
  @ApiOperation({ summary: "Criar novo usuário titular" })
  @ApiBody({
    description: "Dados para criar novo usuário titular (cria whitelabel automaticamente)",
    schema: {
      example: {
        name: "João Silva",
        email: "joao@example.com",
        password: "senha123",
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
        whitelabelId: "wl_123",
        accountId: "acc_123",
      },
    },
  })
  @ApiResponse({ status: 409, description: "Usuário com este email já existe" })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: CreateUserSchema) {
    const { name, email, password } = body

    const hashedPassword = await hash(password, 8)

    const result = await this.prisma.$transaction(async (tx) => {
      const whitelabel = await tx.whitelabel.create({
        data: {
          name: `Família de ${name}`,
        },
      })

      const existingUser = await tx.user.findUnique({
        where: {
          whitelabelId_email: {
            whitelabelId: whitelabel.id,
            email,
          },
        },
      })

      if (existingUser) {
        throw new ConflictException("Um usuário com esse email já existe")
      }

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          whitelabelId: whitelabel.id,
        },
      })

      const account = await tx.account.create({
        data: {
          name: `Conta de ${name}`,
          whitelabelId: whitelabel.id,
        },
      })

      await tx.accountMember.create({
        data: {
          userId: user.id,
          accountId: account.id,
          role: AccountMemberRole.OWNER,
        },
      })

      return { user, whitelabel, account }
    })

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      whitelabelId: result.whitelabel.id,
      accountId: result.account.id,
    }
  }
}
