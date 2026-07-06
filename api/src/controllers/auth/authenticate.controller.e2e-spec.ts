import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import {
  createTitularWithWhitelabel,
} from "../../../test/helpers/e2e-whitelabel"

describe("Authenticate (e2e)", () => {
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

  test("[POST] /sessions", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: "1Mn0o@example.com",
    })

    const response = await request(app.getHttpServer())
      .post("/sessions")
      .set("x-whitelabel-id", setup.whitelabel.id)
      .send({
        email: "1Mn0o@example.com",
        password: "123456",
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
