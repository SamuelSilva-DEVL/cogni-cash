import { SetMetadata } from "@nestjs/common"
import { AccountMemberRole } from "@/generated/prisma/client"

export const ROLES_KEY = "roles"

export const RequireRoles = (...roles: AccountMemberRole[]) =>
  SetMetadata(ROLES_KEY, roles)
