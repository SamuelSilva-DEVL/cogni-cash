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

describe("Fetch List Goals (e2e)", () => {
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

  test("[GET] /goals", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: "1Mn0o@example.com",
    })

    const otherSetup = await createTitularWithWhitelabel(prisma, {
      email: "jane@example.com",
    })

    const accessToken = signAccessToken(jwt, setup)

    await prisma.goal.createMany({
      data: [
        {
          title: "Goal 1",
          targetAmount: 1000.0,
          currentAmount: 0.0,
          deadline: new Date("2024-12-31T23:59:59Z"),
          accountId: setup.account.id,
          slug: "goal-1",
        },
        {
          title: "Goal 2",
          targetAmount: 2000.0,
          currentAmount: 500.0,
          deadline: new Date("2024-11-30T23:59:59Z"),
          accountId: setup.account.id,
          slug: "goal-2",
        },
        {
          title: "Other Account Goal",
          targetAmount: 3000.0,
          currentAmount: 800.0,
          deadline: new Date("2024-10-31T23:59:59Z"),
          accountId: otherSetup.account.id,
          slug: "other-account-goal",
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get("/goals")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      goals: [
        expect.objectContaining({ title: "Goal 1" }),
        expect.objectContaining({ title: "Goal 2" }),
      ],
    })
    expect(response.body.goals).toHaveLength(2)
  })

  afterAll(async () => {
    await app.close()
  })
})
