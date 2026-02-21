import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe("Fetch List Goals (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwT: JwtService

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwT = moduleRef.get(JwtService)

    await app.init()
  })

  test("[GET] /goals", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "1Mn0o@example.com",
        password: "123456",
      },
    })

    const accessToken = jwT.sign({ userId: user.id })

    await prisma.goal.createMany({
      data: [
        {
          title: "Goal 1",
          targetAmount: 1000.0,
          currentAmount: 0.0,
          deadline: "2024-12-31T23:59:59Z",
          userId: user.id,
          slug: "goal-1",
        },
        {
          title: "Goal 2",
          targetAmount: 2000.0,
          currentAmount: 500.0,
          deadline: "2024-11-30T23:59:59Z",
          userId: user.id,
          slug: "goal-2",
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
  })

  afterAll(async () => {
    await app.close()
  })
})
