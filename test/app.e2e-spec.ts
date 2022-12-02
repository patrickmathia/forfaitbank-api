import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';

describe("AppController (e2e)", () => {
   let app: INestApplication;
   let prisma: PrismaService;

   beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
         imports: [AppModule],
      }).compile();

      app = moduleRef.createNestApplication();
      app.useGlobalPipes(
         new ValidationPipe({
            whitelist: true,
         })
      );

      await app.init();
      await app.listen(3300);

      prisma = app.get(PrismaService);
      await prisma.cleanDatabase();
      pactum.request.setBaseUrl("http://localhost:3300");
   });

   afterAll(() => {
      app.close();
   });

   describe('User', () => {
    it.todo('should work')
   })
});
