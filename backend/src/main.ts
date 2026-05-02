import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api", {
    exclude: [{ path: "operator", method: RequestMethod.GET }]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.enableCors({ origin: true });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`BlueBird API http://localhost:${port}/api`);
}

bootstrap();
