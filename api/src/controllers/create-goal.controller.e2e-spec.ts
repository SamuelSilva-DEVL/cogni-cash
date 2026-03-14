import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe("Create Goal (e2e)", () => {
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

  test("[POST] /goals", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "1Mn0o@example.com",
        password: "123456",
      },
    })

    const account = await prisma.account.create({
      data: {
        name: "Conta Principal",
      },
    })

    await prisma.accountMember.create({
      data: {
        userId: user.id,
        accountId: account.id,
        role: "owner",
      },
    })
    
    const accessToken = jwT.sign({ userId: user.id })

    const response = await request(app.getHttpServer())
      .post("/goals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "New Goal",
        targetAmount: 1000.0,
        currentAmount: 0.0,
        deadline: "2024-12-31T23:59:59Z",
      })

    expect(response.statusCode).toBe(201)

    const createdGoal = await prisma.goal.findFirst({
      where: {
        slug: "new-goal",
        accountId: account.id,
      },
    })

    expect(createdGoal).toBeTruthy()
  })

  afterAll(async () => {
    await app.close()
  })
})
