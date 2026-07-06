import { PrismaService } from "@/prisma/prisma.service"
import { AccountMemberRole } from "@/generated/prisma/client"
import { JwtService } from "@nestjs/jwt"
import { hash } from "bcryptjs"
import { WHITELABEL_ID_HEADER } from "@/whitelabel/resolve-whitelabel"

type TitularSetup = {
  whitelabel: { id: string }
  user: { id: string; email: string }
  account: { id: string }
}

export async function createTitularWithWhitelabel(
  prisma: PrismaService,
  data?: { email?: string; name?: string; password?: string },
): Promise<TitularSetup> {
  const whitelabel = await prisma.whitelabel.create({
    data: { name: "Test Whitelabel" },
  })

  const user = await prisma.user.create({
    data: {
      name: data?.name ?? "John Doe",
      email: data?.email ?? "test@example.com",
      password: await hash(data?.password ?? "123456", 8),
      whitelabelId: whitelabel.id,
    },
  })

  const account = await prisma.account.create({
    data: {
      name: "Conta Principal",
      whitelabelId: whitelabel.id,
    },
  })

  await prisma.accountMember.create({
    data: {
      userId: user.id,
      accountId: account.id,
      role: AccountMemberRole.OWNER,
    },
  })

  return { whitelabel, user, account }
}

export function signAccessToken(
  jwt: JwtService,
  setup: TitularSetup,
): string {
  return jwt.sign({
    userId: setup.user.id,
    whitelabelId: setup.whitelabel.id,
    accountId: setup.account.id,
  })
}

export function whitelabelHeader(whitelabelId: string) {
  return { [WHITELABEL_ID_HEADER]: whitelabelId }
}
