import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { compare, hash } from "bcryptjs"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger"
import z from "zod"

const authenticateBodySchema = z.object({
  email: z.email("O email deve ser válido"),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@ApiTags("Auth")
@Controller("/sessions")
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: "Autenticar usuário e obter token JWT" })
  @ApiBody({
    description: "Credenciais do usuário",
    schema: {
      example: {
        email: "usuario@example.com",
        password: "senha123",
      },
      properties: {
        email: { type: "string", description: "Email do usuário" },
        password: { type: "string", description: "Senha do usuário" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Token recebido com sucesso",
    schema: {
      example: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Email ou senha inválidos" })
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    const accessToken = this.jwt.sign({ userId: user.id })

    return {
      access_token: accessToken,
    }
  }
}
