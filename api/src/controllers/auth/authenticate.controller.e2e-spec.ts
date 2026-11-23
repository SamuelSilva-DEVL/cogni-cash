import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import {
  createTitularWithWhitelabel,
} from "../../../test/helpers/e2e-whitelabel"

function readJwtPayload(token: string): {
  userId?: string
  whitelabelId?: string
  accountId?: string
} {
  const payload = token.split(".")[1]
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
}

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

  test("[POST] /sessions resolves the central from the email", async () => {
    const email = `login-by-email-${Date.now()}@example.com`
    const setup = await createTitularWithWhitelabel(prisma, { email })

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email,
      password: "123456",
    })

    expect(response.statusCode).toBe(200)
    expect(readJwtPayload(response.body.access_token)).toMatchObject({
      userId: setup.user.id,
      whitelabelId: setup.whitelabel.id,
      accountId: setup.account.id,
    })
  })

  test("[POST] /sessions rejects an unknown password without a central header", async () => {
    const email = `login-bad-password-${Date.now()}@example.com`
    await createTitularWithWhitelabel(prisma, { email })

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email,
      password: "errada",
    })

    expect(response.statusCode).toBe(401)
  })

  test("[POST] /sessions picks the central whose password matches", async () => {
    const email = `login-two-centrals-${Date.now()}@example.com`
    const matching = await createTitularWithWhitelabel(prisma, {
      email,
      password: "senha-a",
    })
    await createTitularWithWhitelabel(prisma, {
      email,
      password: "senha-b",
    })

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email,
      password: "senha-a",
    })

    expect(response.statusCode).toBe(200)
    expect(readJwtPayload(response.body.access_token).whitelabelId).toBe(
      matching.whitelabel.id,
    )
  })

  test("[POST] /sessions conflicts when the same password matches more than one central", async () => {
    const email = `login-ambiguous-${Date.now()}@example.com`
    await createTitularWithWhitelabel(prisma, { email, password: "123456" })
    await createTitularWithWhitelabel(prisma, { email, password: "123456" })

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email,
      password: "123456",
    })

    expect(response.statusCode).toBe(409)
  })

  afterAll(async () => {
    await app.close()
  })
})
