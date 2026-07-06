import { BadRequestException, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

export const WHITELABEL_ID_HEADER = "x-whitelabel-id"

export async function resolveWhitelabelById(
  prisma: PrismaService,
  whitelabelId: string | undefined,
) {
  if (!whitelabelId?.trim()) {
    throw new BadRequestException(
      `Header ${WHITELABEL_ID_HEADER} é obrigatório`,
    )
  }

  const whitelabel = await prisma.whitelabel.findUnique({
    where: { id: whitelabelId.trim() },
  })

  if (!whitelabel || whitelabel.status !== "active") {
    throw new NotFoundException("Central whitelabel não encontrada")
  }

  return whitelabel
}
