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

describe("Account Members (e2e)", () => {
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

  test("[POST] /accounts/members/invite + accept", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: "titular@example.com",
    })
    const accessToken = signAccessToken(jwt, setup)

    const inviteResponse = await request(app.getHttpServer())
      .post("/accounts/members/invite")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "dependente@example.com",
        role: "DEPENDENT",
      })

    expect(inviteResponse.statusCode).toBe(201)
    expect(inviteResponse.body.token).toBeTruthy()

    const acceptResponse = await request(app.getHttpServer())
      .post("/accounts/members/accept")
      .send({
        token: inviteResponse.body.token,
        name: "Maria Dependente",
        password: "123456",
      })

    expect(acceptResponse.statusCode).toBe(201)
    expect(acceptResponse.body).toEqual(
      expect.objectContaining({
        email: "dependente@example.com",
        whitelabelId: setup.whitelabel.id,
        accountId: setup.account.id,
        access_token: expect.any(String),
      }),
    )

    const member = await prisma.accountMember.findFirst({
      where: {
        accountId: setup.account.id,
        user: { email: "dependente@example.com" },
      },
    })

    expect(member).toBeTruthy()
    expect(member?.role).toBe("DEPENDENT")
  })

  afterAll(async () => {
    await app.close()
  })
})
