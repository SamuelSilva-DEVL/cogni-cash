import {
  Body,
  ConflictException,
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
    description:
      "Opcional. Quando enviado, autentica o e-mail só nessa central. Sem o header, a central é resolvida pelo e-mail.",
    required: false,
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
  @ApiResponse({
    status: 409,
    description:
      "O e-mail e a senha conferem em mais de uma central ativa",
  })
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(
    @Body() body: AuthenticateBodySchema,
    @Headers(WHITELABEL_ID_HEADER) whitelabelIdHeader: string | undefined,
  ) {
    const { email, password } = body
    const user = whitelabelIdHeader?.trim()
      ? await this.findUserInWhitelabel(email, password, whitelabelIdHeader)
      : await this.findUserByEmail(email, password)

    const membership = await this.prisma.accountMember.findFirst({
      where: {
        userId: user.id,
        account: {
          whitelabelId: user.whitelabelId,
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
      whitelabelId: user.whitelabelId,
      accountId: membership.accountId,
    })

    return {
      access_token: accessToken,
    }
  }

  private async findUserInWhitelabel(
    email: string,
    password: string,
    whitelabelIdHeader: string,
  ) {
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

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    return user
  }

  private async findUserByEmail(email: string, password: string) {
    const candidates = await this.prisma.user.findMany({
      where: {
        email,
        whitelabel: { status: "active" },
      },
    })

    const matches: typeof candidates = []

    for (const candidate of candidates) {
      if (await compare(password, candidate.password)) {
        matches.push(candidate)
      }
    }

    if (matches.length > 1) {
      throw new ConflictException(
        "Este e-mail está vinculado a mais de uma central. Não foi possível identificar qual usar.",
      )
    }

    const user = matches[0]

    if (!user) {
      throw new UnauthorizedException("Email ou senha inválidos")
    }

    return user
  }
}
