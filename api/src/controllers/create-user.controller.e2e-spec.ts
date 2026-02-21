import { AppModule } from "@/app.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe("CreateUserController (e2e)", () => {
  let app: INestApplication

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
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
  })

  afterAll(async () => {
    await app.close()
  })
})
