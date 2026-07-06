import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AccountMemberRole } from "@/generated/prisma/client"
import { UserPayload } from "@/auth/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"

export type ResolvedAccountContext = {
  whitelabelId: string
  accountId: string
  userId: string
  role: AccountMemberRole
  membershipId: string
}

@Injectable()
export class AccountContextService {
  constructor(private prisma: PrismaService) {}

  async resolve(user: UserPayload): Promise<ResolvedAccountContext> {
    const membership = await this.prisma.accountMember.findFirst({
      where: {
        userId: user.userId,
        accountId: user.accountId,
        account: {
          whitelabelId: user.whitelabelId,
        },
        user: {
          whitelabelId: user.whitelabelId,
        },
      },
      select: {
        id: true,
        role: true,
        accountId: true,
        userId: true,
        account: {
          select: {
            whitelabelId: true,
          },
        },
      },
    })

    if (!membership) {
      throw new UnauthorizedException(
        "Usuário sem conta vinculada nesta central",
      )
    }

    return {
      whitelabelId: membership.account.whitelabelId,
      accountId: membership.accountId,
      userId: membership.userId,
      role: membership.role,
      membershipId: membership.id,
    }
  }
}
