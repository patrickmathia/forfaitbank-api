import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   await app.listen(3000);
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
      })
   );

   app.enableCors({
      origin: "*",
      credentials: true,
      allowedHeaders: "*",
      optionsSuccessStatus: 200,
   });
}
bootstrap();
