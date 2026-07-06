import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"
import { Env } from "./env"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get("PORT", { infer: true })

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle("Cogni Cash API")
    .setDescription("API de gerenciamento de finanças pessoais")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  await app.listen(port)
  console.log(`API rodando em http://localhost:${port}`)
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`)
}
bootstrap()
