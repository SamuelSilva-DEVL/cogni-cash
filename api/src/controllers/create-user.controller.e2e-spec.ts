import { AppModule } from "@/app.module"
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe("CreateUserController (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  }) 

  test("[POST] /users", async () => {
    const response = await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "John Doe",
        email: "1Mn0o@example.com",
        password: "123456",
      })
    
    expect(response.statusCode).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: "1Mn0o@example.com",
      },
    })

    expect(userOnDatabase).toBeTruthy()

    const membership = await prisma.accountMember.findFirst({
      where: {
        userId: userOnDatabase?.id,
      },
      include: {
        account: true,
      },
    })

    expect(membership).toBeTruthy()
    expect(membership?.account).toBeTruthy()
  })

  afterAll(async () => {
    await app.close()
  })
})
