import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { Test } from "@nestjs/testing"
import request from "supertest"
import {
  createTitularWithWhitelabel,
  signAccessToken,
} from "../../../test/helpers/e2e-whitelabel"

describe("Manage Goal By Id (e2e)", () => {
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

  test("documents goal routes in swagger", () => {
    const config = new DocumentBuilder()
      .setTitle("Cogni Cash API")
      .setVersion("1.0")
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    const byId = document.paths["/goals/goal/{id}"]

    expect(document.paths["/goals"]?.get?.summary).toBe(
      "Listar metas financeiras do usuário",
    )
    expect(byId?.get?.summary).toBe("Buscar meta financeira por ID")
    expect(byId?.patch?.summary).toBe("Atualizar meta financeira por ID")
    expect(byId?.delete?.summary).toBe("Deletar meta financeira por ID")
    expect(byId?.patch?.requestBody).toBeTruthy()
  })

  test("[PATCH] /goals/goal/:id", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: "update-goal@example.com",
    })

    const otherSetup = await createTitularWithWhitelabel(prisma, {
      email: "update-goal-other@example.com",
    })

    const accessToken = signAccessToken(jwt, setup)

    const goal = await prisma.goal.create({
      data: {
        title: "Reserva",
        targetAmount: 1000,
        currentAmount: 100,
        accountId: setup.account.id,
        slug: "reserva",
      },
    })

    const otherGoal = await prisma.goal.create({
      data: {
        title: "Meta alheia",
        targetAmount: 500,
        currentAmount: 0,
        accountId: otherSetup.account.id,
        slug: "meta-alheia",
      },
    })

    const response = await request(app.getHttpServer())
      .patch(`/goals/goal/${goal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Reserva de emergência",
        targetAmount: 2000,
        currentAmount: 400,
        deadline: "2026-12-31T23:59:59Z",
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      message: "Meta financeira atualizada com sucesso",
    })

    const updatedGoal = await prisma.goal.findUnique({
      where: { id: goal.id },
    })

    expect(updatedGoal?.title).toBe("Reserva de emergência")
    expect(Number(updatedGoal?.targetAmount)).toBe(2000)
    expect(Number(updatedGoal?.currentAmount)).toBe(400)
    expect(updatedGoal?.deadline).toEqual(new Date("2026-12-31T23:59:59Z"))

    const otherAccountResponse = await request(app.getHttpServer())
      .patch(`/goals/goal/${otherGoal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Tentativa",
        targetAmount: 1,
        currentAmount: 1,
      })

    expect(otherAccountResponse.statusCode).toBe(404)

    const untouchedGoal = await prisma.goal.findUnique({
      where: { id: otherGoal.id },
    })

    expect(untouchedGoal?.title).toBe("Meta alheia")
  })

  test("[DELETE] /goals/goal/:id", async () => {
    const setup = await createTitularWithWhitelabel(prisma, {
      email: "delete-goal@example.com",
    })

    const otherSetup = await createTitularWithWhitelabel(prisma, {
      email: "delete-goal-other@example.com",
    })

    const accessToken = signAccessToken(jwt, setup)

    const goal = await prisma.goal.create({
      data: {
        title: "Para apagar",
        targetAmount: 300,
        currentAmount: 0,
        accountId: setup.account.id,
        slug: "para-apagar",
      },
    })

    const otherGoal = await prisma.goal.create({
      data: {
        title: "Não apagar",
        targetAmount: 300,
        currentAmount: 0,
        accountId: otherSetup.account.id,
        slug: "nao-apagar",
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/goals/goal/${goal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      message: "Meta financeira deletada com sucesso",
    })

    const deletedGoal = await prisma.goal.findUnique({
      where: { id: goal.id },
    })

    expect(deletedGoal).toBeNull()

    const otherAccountResponse = await request(app.getHttpServer())
      .delete(`/goals/goal/${otherGoal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(otherAccountResponse.statusCode).toBe(404)

    const missingResponse = await request(app.getHttpServer())
      .delete("/goals/goal/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(missingResponse.statusCode).toBe(404)

    const keptGoal = await prisma.goal.findUnique({
      where: { id: otherGoal.id },
    })

    expect(keptGoal).toBeTruthy()
  })

  afterAll(async () => {
    await app.close()
  })
})
