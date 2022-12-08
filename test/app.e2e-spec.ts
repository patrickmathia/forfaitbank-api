import { UpdateOperationDto } from "./../src/operation/dto/update-operation.dto";
import { CreateOperationDto } from "./../src/operation/dto/create-operation.dto";
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

   jest.setTimeout(10000);

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
      pactum.request.setDefaultTimeout(100000);
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

   describe("Operations", () => {
      it("should get an empty array of operations", () => {
         return pactum
            .spec()
            .get("/operations")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .expectBody([])
            .expectStatus(200);
      });

      it("should create a concluded operation", () => {
         const dto: CreateOperationDto = {
            name: "Test Operation 1",
            value: 5000,
            billType: 100,
         };

         return pactum
            .spec()
            .post("/operations")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(dto)
            .expectStatus(201)
            .expectJsonLike({
               parentOperationId: null,
               packages: "$V.length === 50",
               status: "concluded",
            })
            .stores("firstOperationId", "id");
      });

      it("should create a reserved operation", () => {
         const dto: CreateOperationDto = {
            name: "Test Operation 2",
            value: 3499,
            billType: 100,
         };

         return pactum
            .spec()
            .post("/operations")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(dto)
            .expectStatus(201)
            .expectJsonLike({
               parentOperationId: null,
               packages: "$V.length === 36",
               status: "reserved",
            });
      });

      it("should get operation by id", () => {
         return pactum
            .spec()
            .get(`/operations/$S{firstOperationId}`)
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .expectStatus(200)
            .expectJsonLike({ packages: "$V.length === 50" });
      });

      it("should create distinct children operations", () => {
         const dto: CreateOperationDto = {
            name: "Big operation 1",
            value: 20000,
            billType: 50,
         };

         return pactum
            .spec()
            .post("/operations")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(dto)
            .expectStatus(201)
            .expectJsonLike({
               parentOperationId: "$V == null",
               packages: "$V.length === 0",
               children: "$V.length === 4",
            });
      });

      it("should create a big operation", () => {
         const dto: CreateOperationDto = {
            name: "Big operation 2",
            value: 223392,
            billType: 10,
         };

         return pactum
            .spec()
            .post("/operations")
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(dto)
            .expectStatus(201)
            .expectJsonLike({
               parentOperationId: "$V == null",
               packages: "$V.length === 0",
               children: "$V.length > 0",
               status: "reserved",
            })
            .stores("relatedOperationId", "id");
      });

      it("should update operation", () => {
         const updateDto: UpdateOperationDto = {
            name: "Renamed test operation with children",
         };
         return pactum
            .spec()
            .patch(`/operations/$S{firstOperationId}`)
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .withBody(updateDto)
            .expectStatus(200)
            .expectBodyContains(updateDto.name);
      });

      it("should delete simple operation", () => {
         return pactum
            .spec()
            .delete(`/operations/$S{firstOperationId}`)
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .expectStatus(200);
      });

      it("should delete operation with relationship", () => {
         return pactum
            .spec()
            .delete(`/operations/$S{relatedOperationId}`)
            .withHeaders({
               Authorization: "Bearer $S{userAt}",
            })
            .expectStatus(200);
      });
   });
});
