import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { compare } from "bcryptjs"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from "@nestjs/swagger"
import {
  resolveWhitelabelById,
  WHITELABEL_ID_HEADER,
} from "@/whitelabel/resolve-whitelabel"
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
  @ApiHeader({
    name: WHITELABEL_ID_HEADER,
    description: "ID da central whitelabel do usuário",
    required: true,
  })
  @ApiBody({
    description: "Credenciais do usuário",
    schema: {
      example: {
        email: "usuario@example.com",
        password: "senha123",
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
  async handle(
    @Body() body: AuthenticateBodySchema,
    @Headers(WHITELABEL_ID_HEADER) whitelabelIdHeader: string | undefined,
  ) {
    const { email, password } = body

    const whitelabel = await resolveWhitelabelById(
      this.prisma,
      whitelabelIdHeader,
    )

    const user = await this.prisma.user.findUnique({
      where: {
        whitelabelId_email: {
          whitelabelId: whitelabel.id,
          email,
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    const membership = await this.prisma.accountMember.findFirst({
      where: {
        userId: user.id,
        account: {
          whitelabelId: whitelabel.id,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        accountId: true,
      },
    })

    if (!membership) {
      throw new UnauthorizedException("Usuário sem conta vinculada")
    }

    const accessToken = this.jwt.sign({
      userId: user.id,
      whitelabelId: whitelabel.id,
      accountId: membership.accountId,
    })

    return {
      access_token: accessToken,
    }
  }
}
