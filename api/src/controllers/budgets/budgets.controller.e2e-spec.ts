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

describe("Budgets (e2e)", () => {
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

  test("[POST] /budgets creates limit by category name", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `budget-name-${Date.now()}@example.com`,
    })

    const accessToken = signAccessToken(jwt, setup)

    const response = await request(app.getHttpServer())
      .post("/budgets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoryName: "Moradia",
        limit: 1200,
        month: 8,
        year: 2026,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.categoryName).toBe("Moradia")
    expect(response.body.limit).toBe(1200)

    const category = await prisma.category.findFirst({
      where: {
        name: "Moradia",
        accountId: setup.account.id,
      },
    })

    expect(category).toBeTruthy()
  })

  test("[POST] /budgets creates limit and [PATCH] updates it", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `budget-${Date.now()}@example.com`,
    })

    const category = await prisma.category.create({
      data: {
        name: "Alimentação",
        accountId: setup.account.id,
      },
    })

    const accessToken = signAccessToken(jwt, setup)

    const createResponse = await request(app.getHttpServer())
      .post("/budgets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoryId: category.id,
        limit: 500,
        month: 7,
        year: 2026,
      })

    expect(createResponse.statusCode).toBe(201)
    expect(createResponse.body.limit).toBe(500)

    const updateResponse = await request(app.getHttpServer())
      .patch(`/budgets/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ limit: 750 })

    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.body.limit).toBe(750)

    const budgets = await prisma.budget.findMany({
      where: {
        accountId: setup.account.id,
        categoryId: category.id,
        month: 7,
        year: 2026,
      },
    })

    expect(budgets).toHaveLength(1)
    expect(Number(budgets[0].limit)).toBe(750)
  })

  test("[GET] /budgets lists limits with spent and status", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `budget-list-${Date.now()}@example.com`,
    })

    const category = await prisma.category.create({
      data: {
        name: "Transporte",
        accountId: setup.account.id,
      },
    })

    await prisma.budget.create({
      data: {
        limit: 100,
        month: 7,
        year: 2026,
        accountId: setup.account.id,
        categoryId: category.id,
      },
    })

    await prisma.transaction.create({
      data: {
        description: "Uber",
        amount: 120,
        date: new Date("2026-07-05T12:00:00.000Z"),
        type: "EXPENSE",
        accountId: setup.account.id,
        categoryId: category.id,
        createdBy: setup.user.id,
      },
    })

    const accessToken = signAccessToken(jwt, setup)

    const response = await request(app.getHttpServer())
      .get("/budgets")
      .query({ month: 7, year: 2026 })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryName: "Transporte",
          limit: 100,
          spent: 120,
          remaining: 0,
          percentUsed: 120,
          status: "exceeded",
        }),
      ]),
    )
  })

  test("[DELETE] /budgets removes limit", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: `budget-delete-${Date.now()}@example.com`,
    })

    const category = await prisma.category.create({
      data: {
        name: "Lazer",
        accountId: setup.account.id,
      },
    })

    const budget = await prisma.budget.create({
      data: {
        limit: 200,
        month: 7,
        year: 2026,
        accountId: setup.account.id,
        categoryId: category.id,
      },
    })

    const accessToken = signAccessToken(jwt, setup)

    const response = await request(app.getHttpServer())
      .delete(`/budgets/${budget.id}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const deleted = await prisma.budget.findUnique({ where: { id: budget.id } })
    expect(deleted).toBeNull()
  })

  afterAll(async () => {
    await app.close()
  })
})
