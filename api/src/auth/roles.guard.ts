import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AccountMemberRole } from "@/generated/prisma/client"
import { AccountContextService } from "@/services/account-context.service"
import { ROLES_KEY } from "./require-roles.decorator"
import { UserPayload } from "./jwt.strategy"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accountContext: AccountContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<AccountMemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!allowedRoles || allowedRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as UserPayload
    const accountContext = await this.accountContext.resolve(user)

    if (!allowedRoles.includes(accountContext.role)) {
      throw new ForbiddenException("Você não tem permissão para esta ação")
    }

    request.accountContext = accountContext

    return true
  }
}
