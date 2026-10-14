import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { AnalystLlmClient } from "@/services/analyst/analyst-llm.client"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { vi } from "vitest"
import {
  createTitularWithWhitelabel,
  signAccessToken,
} from "../../../test/helpers/e2e-whitelabel"

describe("Analyst (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  const complete = vi.fn().mockResolvedValue("A receita deste período cobre as despesas.")

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AnalystLlmClient)
      .useValue({
        complete,
        isConfigured: () => true,
      })
      .compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[POST] /analyst/messages answers from the account period", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `analyst-${Date.now()}@example.com`,
    })

    const market = await prisma.category.create({
      data: {
        name: "Mercado",
        accountId: setup.account.id,
      },
    })

    await prisma.transaction.createMany({
      data: [
        {
          description: "Salário",
          amount: 3000,
          date: new Date(),
          type: "INCOME",
          accountId: setup.account.id,
          createdBy: setup.user.id,
        },
        {
          description: "Feira",
          amount: 500.25,
          date: new Date(),
          type: "EXPENSE",
          accountId: setup.account.id,
          categoryId: market.id,
          createdBy: setup.user.id,
        },
        {
          description: "Café",
          amount: 80,
          date: new Date(),
          type: "EXPENSE",
          accountId: setup.account.id,
          createdBy: setup.user.id,
        },
        {
          description: "Lançamento antigo",
          amount: 9999,
          date: new Date("2020-01-15T12:00:00.000Z"),
          type: "EXPENSE",
          accountId: setup.account.id,
          createdBy: setup.user.id,
        },
      ],
    })

    const accessToken = signAccessToken(jwt, setup)

    const response = await request(app.getHttpServer())
      .post("/analyst/messages")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        message: "A receita cobre as despesas?",
        period: "month",
        history: [{ role: "user", content: "Olá" }],
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.reply).toBe("A receita deste período cobre as despesas.")
    expect(response.body.snapshot.income).toBe("3000.00")
    expect(response.body.snapshot.expense).toBe("580.25")
    expect(response.body.snapshot.balance).toBe("2419.75")
    expect(response.body.snapshot.transactionCount).toBe(3)
    expect(response.body.snapshot.expenseCategories[0]).toMatchObject({
      name: "Mercado",
      total: "500.25",
    })

    const system = complete.mock.calls.at(-1)?.[0] as string
    const turns = complete.mock.calls.at(-1)?.[1] as { role: string; content: string }[]

    expect(system).toContain("3.000,00")
    expect(system).toContain("Mercado")
    expect(system).not.toContain("9.999,00")
    expect(turns.at(-1)).toEqual({
      role: "user",
      content: "A receita cobre as despesas?",
    })
    expect(turns[0]).toEqual({ role: "user", content: "Olá" })
  })

  test("[GET] /analyst/snapshot returns the same totals", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `analyst-snapshot-${Date.now()}@example.com`,
    })

    await prisma.transaction.create({
      data: {
        description: "Freelance",
        amount: 150,
        date: new Date(),
        type: "INCOME",
        accountId: setup.account.id,
        createdBy: setup.user.id,
      },
    })

    const accessToken = signAccessToken(jwt, setup)

    const response = await request(app.getHttpServer())
      .get("/analyst/snapshot")
      .query({ period: "month" })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.income).toBe("150.00")
    expect(response.body.expense).toBe("0.00")
    expect(response.body.ready).toBe(true)
  })

  test("[POST] /analyst/messages without token", async () => {
    const response = await request(app.getHttpServer())
      .post("/analyst/messages")
      .send({ message: "Oi", period: "month" })

    expect(response.statusCode).toBe(401)
  })

  afterAll(async () => {
    await app.close()
  })
})
