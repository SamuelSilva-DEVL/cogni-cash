import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { hash } from "bcryptjs"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { RolesGuard } from "@/auth/roles.guard"
import { RequireRoles } from "@/auth/require-roles.decorator"
import { MANAGE_MEMBERS_ROLES } from "@/auth/account-member-role"
import { CurrentUser } from "@/auth/current-user-decorator"
import { CurrentAccountContext } from "@/auth/current-account-context.decorator"
import { type UserPayload } from "@/auth/jwt.strategy"
import { AccountContextService, type ResolvedAccountContext } from "@/services/account-context.service"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"
import { PrismaService } from "@/prisma/prisma.service"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger"
import { AccountMemberRole } from "@/generated/prisma/client"
import z from "zod"

const inviteBodySchema = z.object({
  email: z.email("O email deve ser válido"),
  role: z
    .enum([AccountMemberRole.DEPENDENT, AccountMemberRole.VIEWER])
    .default(AccountMemberRole.DEPENDENT),
})

type InviteBodySchema = z.infer<typeof inviteBodySchema>

const inviteValidationPipe = new ZodValidationPipe(inviteBodySchema)

@ApiTags("Account Members")
@ApiBearerAuth()
@Controller("/accounts/members")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InviteMemberController {
  constructor(
    private prisma: PrismaService,
    private accountContext: AccountContextService,
  ) {}

  @Post("invite")
  @RequireRoles(...MANAGE_MEMBERS_ROLES)
  @HttpCode(201)
  @ApiOperation({ summary: "Convidar dependente para a conta" })
  @ApiBody({
    schema: {
      example: {
        email: "dependente@example.com",
        role: "DEPENDENT",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Convite criado com sucesso" })
  async invite(
    @Body(inviteValidationPipe) body: InviteBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const context = await this.accountContext.resolve(user)
    const { email, role } = body

    const existingMember = await this.prisma.user.findFirst({
      where: {
        email,
        whitelabelId: context.whitelabelId,
        memberships: {
          some: { accountId: context.accountId },
        },
      },
    })

    if (existingMember) {
      throw new ConflictException("Este email já é membro desta conta")
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await this.prisma.memberInvite.upsert({
      where: {
        whitelabelId_email_accountId: {
          whitelabelId: context.whitelabelId,
          email,
          accountId: context.accountId,
        },
      },
      create: {
        email,
        role,
        expiresAt,
        accountId: context.accountId,
        whitelabelId: context.whitelabelId,
        invitedById: user.userId,
      },
      update: {
        role,
        expiresAt,
        acceptedAt: null,
        invitedById: user.userId,
      },
    })

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
    }
  }
}

const acceptBodySchema = z.object({
  token: z.uuid(),
  name: z.string().min(1, "O nome é obrigatório"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
})

type AcceptBodySchema = z.infer<typeof acceptBodySchema>

const acceptValidationPipe = new ZodValidationPipe(acceptBodySchema)

@ApiTags("Account Members")
@Controller("/accounts/members")
export class AcceptInviteController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post("accept")
  @HttpCode(201)
  @ApiOperation({ summary: "Aceitar convite e criar conta de dependente" })
  @ApiBody({
    schema: {
      example: {
        token: "uuid-do-convite",
        name: "Maria Silva",
        password: "senha123",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Convite aceito com sucesso" })
  async accept(@Body(acceptValidationPipe) body: AcceptBodySchema) {
    const { token, name, password } = body

    const invite = await this.prisma.memberInvite.findUnique({
      where: { token },
    })

    if (!invite || invite.acceptedAt) {
      throw new ConflictException("Convite inválido ou já utilizado")
    }

    if (invite.expiresAt < new Date()) {
      throw new ConflictException("Convite expirado")
    }

    const hashedPassword = await hash(password, 8)

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          whitelabelId_email: {
            whitelabelId: invite.whitelabelId,
            email: invite.email,
          },
        },
      })

      if (existingUser) {
        throw new ConflictException(
          "Já existe um usuário com este email nesta central",
        )
      }

      const user = await tx.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          whitelabelId: invite.whitelabelId,
        },
      })

      await tx.accountMember.create({
        data: {
          userId: user.id,
          accountId: invite.accountId,
          role: invite.role,
        },
      })

      await tx.memberInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      })

      return user
    })

    const accessToken = this.jwt.sign({
      userId: result.id,
      whitelabelId: invite.whitelabelId,
      accountId: invite.accountId,
    })

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      whitelabelId: invite.whitelabelId,
      accountId: invite.accountId,
      access_token: accessToken,
    }
  }
}

@ApiTags("Account Members")
@ApiBearerAuth()
@Controller("/accounts/members")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListMembersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequireRoles(...MANAGE_MEMBERS_ROLES, AccountMemberRole.DEPENDENT, AccountMemberRole.VIEWER)
  @ApiOperation({ summary: "Listar membros da conta" })
  @ApiResponse({ status: 200, description: "Membros listados com sucesso" })
  async list(@CurrentAccountContext() context: ResolvedAccountContext) {
    const members = await this.prisma.accountMember.findMany({
      where: { accountId: context.accountId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return {
      members: members.map((member) => ({
        id: member.id,
        role: member.role,
        user: member.user,
        createdAt: member.createdAt.toISOString(),
      })),
    }
  }
}

const updateRoleSchema = z.object({
  role: z.enum([
    AccountMemberRole.DEPENDENT,
    AccountMemberRole.VIEWER,
  ]),
})

type UpdateRoleSchema = z.infer<typeof updateRoleSchema>

const updateRolePipe = new ZodValidationPipe(updateRoleSchema)

@ApiTags("Account Members")
@ApiBearerAuth()
@Controller("/accounts/members")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateMemberController {
  constructor(private prisma: PrismaService) {}

  @Patch(":id")
  @RequireRoles(...MANAGE_MEMBERS_ROLES)
  @ApiOperation({ summary: "Alterar papel de um membro" })
  async update(
    @Param("id") memberId: string,
    @Body(updateRolePipe) body: UpdateRoleSchema,
    @CurrentAccountContext() context: ResolvedAccountContext,
  ) {
    const member = await this.prisma.accountMember.findFirst({
      where: {
        id: memberId,
        accountId: context.accountId,
      },
    })

    if (!member) {
      throw new ConflictException("Membro não encontrado")
    }

    if (member.role === AccountMemberRole.OWNER) {
      throw new ConflictException("Não é possível alterar o papel do titular")
    }

    const updated = await this.prisma.accountMember.update({
      where: { id: memberId },
      data: { role: body.role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return {
      id: updated.id,
      role: updated.role,
      user: updated.user,
    }
  }
}

@ApiTags("Account Members")
@ApiBearerAuth()
@Controller("/accounts/members")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RemoveMemberController {
  constructor(private prisma: PrismaService) {}

  @Delete(":id")
  @RequireRoles(...MANAGE_MEMBERS_ROLES)
  @HttpCode(204)
  @ApiOperation({ summary: "Remover membro da conta" })
  async remove(
    @Param("id") memberId: string,
    @CurrentAccountContext() context: ResolvedAccountContext,
    @CurrentUser() user: UserPayload,
  ) {
    const member = await this.prisma.accountMember.findFirst({
      where: {
        id: memberId,
        accountId: context.accountId,
      },
    })

    if (!member) {
      throw new ConflictException("Membro não encontrado")
    }

    if (member.role === AccountMemberRole.OWNER) {
      throw new ConflictException("Não é possível remover o titular")
    }

    if (member.userId === user.userId) {
      throw new ConflictException("Use outro titular para remover a si mesmo")
    }

    await this.prisma.accountMember.delete({ where: { id: memberId } })
  }
}
