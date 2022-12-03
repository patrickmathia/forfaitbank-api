import { Operation } from "./../src/operation/entities/operation.entity";
import { CreatePackageDto } from "./../src/package/dto/create-package.dto";
import { EditUserDto } from "./../src/user/dto/edit-user.dto";
import { AuthDto } from "./../src/auth/dto/auth.dto";
import { CreateUserDto } from "./../src/user/dto/create-user.dto";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";

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

   afterAll(async () => {
      await prisma.$disconnect();
      app.close();
   });

   describe("Auth", () => {
      const dto: CreateUserDto = {
         name: "Patrick",
         email: "pms@gmail.com",
         password: "1234",
         cpf: "432.234.432-43",
         birthdate: new Date(2003, 11, 22),
         address: "Rua 5B",
      };

      const authDto: AuthDto = {
         email: dto.email,
         password: dto.password,
      };

      it("should throw if no body provided", () => {
         return pactum.spec().post("/auth/signup").expectStatus(400);
      });

      it("should sign up", () => {
         return pactum
            .spec()
            .post("/auth/signup")
            .withBody(dto)
            .expectStatus(201);
      });

      it("should sign in", () => {
         return pactum
            .spec()
            .post("/auth/signin")
            .withBody(authDto)
            .expectStatus(200)
            .stores("userAt", "access_token");
      });
   });

   describe("User", () => {
      it("should throw if no access token provided", () => {
         return pactum.spec().get("/users/me").expectStatus(401);
      });
      it("should get current user", () => {
         return pactum
            .spec()
            .get("/users/me")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .expectStatus(200);
      });
      it("should edit user", () => {
         const dto: EditUserDto = {
            name: "Patrick Matias",
            address: "Rua 5B, Jardim Nova Cidade",
            birthdate: new Date(2003, 1, 1),
         };

         return pactum
            .spec()
            .patch("/users")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains(dto.name)
            .expectBodyContains(dto.address)
            .expectBodyContains(dto.birthdate);
      });
   });

   describe("Packages", () => {
      const op: Operation = {
         name: "operation 1",
         billType: 10,
         value: 5000,
         userId: 1,
         status: "closed",
         packages: [],
      };

      const dto: CreatePackageDto = {
         billQuantity: 50,
         billType: 10,
         status: "closed",
         color: "#abc123",
         parentOperation: op,
      };

      it("should create package", () => {
         return pactum.spec().post("/packages").withBody(dto);
      });
      it("should update package", () => {});
      it("should edit package", () => {});
      it("should delete package", () => {});
   });

   describe("Operations", () => {
      it("should create operation", () => {});
      it("should update operation", () => {});
      it("should edit operation", () => {});
      it("should delete operation", () => {});
   });
});
