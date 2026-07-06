import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { WHITELABEL_ID_HEADER } from "./resolve-whitelabel"

export const WhitelabelIdHeader = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const headers = request.headers
    return (
      headers[WHITELABEL_ID_HEADER] ??
      headers["x-whitelabel-id"]
    ) as string | undefined
  },
)
