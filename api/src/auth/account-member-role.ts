import { AccountMemberRole } from "@/generated/prisma/client"

export { AccountMemberRole }

export const WRITE_FINANCE_ROLES: AccountMemberRole[] = [
  AccountMemberRole.OWNER,
  AccountMemberRole.DEPENDENT,
]

export const WRITE_STRUCTURE_ROLES: AccountMemberRole[] = [
  AccountMemberRole.OWNER,
]

export const MANAGE_MEMBERS_ROLES: AccountMemberRole[] = [
  AccountMemberRole.OWNER,
]

export const READ_ROLES: AccountMemberRole[] = [
  AccountMemberRole.OWNER,
  AccountMemberRole.DEPENDENT,
  AccountMemberRole.VIEWER,
]
