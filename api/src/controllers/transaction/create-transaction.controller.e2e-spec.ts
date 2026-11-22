import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import {
  createTitularWithWhitelabel,
  signAccessToken,
} from "../../../test/helpers/e2e-whitelabel"

describe("Create Transaction (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[POST] /transactions persists expense kind and income recurrence", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `txn-${Date.now()}@example.com`,
    })

    const accessToken = signAccessToken(jwt, setup)

    const expenseResponse = await request(app.getHttpServer())
      .post("/transactions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "Aluguel",
        amount: 1800,
        date: "2026-09-29T12:00:00.000Z",
        type: "EXPENSE",
        expenseKind: "FIXED",
        categoryName: "Moradia",
      })

    expect(expenseResponse.statusCode).toBe(201)
    expect(expenseResponse.body).toMatchObject({
      description: "Aluguel",
      type: "EXPENSE",
      expenseKind: "FIXED",
      recurrence: null,
      categoryName: "Moradia",
    })

    const incomeResponse = await request(app.getHttpServer())
      .post("/transactions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "Salário",
        amount: 5000,
        date: "2026-09-29T12:00:00.000Z",
        type: "INCOME",
        recurrence: "MONTHLY",
        source: "Trabalho",
      })

    expect(incomeResponse.statusCode).toBe(201)
    expect(incomeResponse.body).toMatchObject({
      description: "Salário",
      type: "INCOME",
      expenseKind: null,
      recurrence: "MONTHLY",
      source: "Trabalho",
    })

    const expenses = await request(app.getHttpServer())
      .get("/transactions")
      .query({ type: "EXPENSE" })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(expenses.statusCode).toBe(200)
    expect(expenses.body.transactions[0]).toMatchObject({
      description: "Aluguel",
      expenseKind: "FIXED",
    })

    const incomes = await request(app.getHttpServer())
      .get("/transactions")
      .query({ type: "INCOME" })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(incomes.statusCode).toBe(200)
    expect(incomes.body.transactions[0]).toMatchObject({
      description: "Salário",
      recurrence: "MONTHLY",
      source: "Trabalho",
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
