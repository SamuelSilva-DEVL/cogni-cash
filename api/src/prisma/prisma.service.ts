import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL
    const url = new URL(connectionString!)
    const schema = url.searchParams.get("schema") || undefined
    const adapter = new PrismaPg(
      { connectionString: connectionString },
      { schema },
    )
    super({ adapter, log: ["error", "warn"] })
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
