import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { ResolvedAccountContext } from "@/services/account-context.service"

export const CurrentAccountContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ResolvedAccountContext => {
    const request = ctx.switchToHttp().getRequest()
    return request.accountContext
  },
)
