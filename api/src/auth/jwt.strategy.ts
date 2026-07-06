import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { Env } from "@/env"
import { PrismaService } from "@/prisma/prisma.service"
import z from "zod"

const tokenSchema = z.object({
  userId: z.uuid(),
  whitelabelId: z.uuid(),
  accountId: z.uuid(),
})

const legacyTokenSchema = z.object({
  userId: z.uuid(),
})

export type UserPayload = z.infer<typeof tokenSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Env, true>,
    private prisma: PrismaService,
  ) {
    const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true })

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    })
  }

  async validate(payload: unknown): Promise<UserPayload> {
    const parsed = tokenSchema.safeParse(payload)

    if (parsed.success) {
      return parsed.data
    }

    const legacy = legacyTokenSchema.safeParse(payload)

    if (legacy.success) {
      const membership = await this.prisma.accountMember.findFirst({
        where: { userId: legacy.data.userId },
        orderBy: { createdAt: "asc" },
        select: {
          accountId: true,
          account: {
            select: { whitelabelId: true },
          },
        },
      })

      if (!membership) {
        throw new UnauthorizedException(
          "Token inválido. Faça login novamente.",
        )
      }

      return {
        userId: legacy.data.userId,
        whitelabelId: membership.account.whitelabelId,
        accountId: membership.accountId,
      }
    }

    throw new UnauthorizedException(
      "Token inválido ou expirado. Faça login novamente.",
    )
  }
}
