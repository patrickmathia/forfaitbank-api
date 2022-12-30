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
import { Operation } from "src/operation/entities/operation.entity";

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
         birthdate: "2003-11-22",
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

      it("should throw if same email", () => {
         return pactum
            .spec()
            .post("/auth/signup")
            .withBody(dto)
            .expectStatus(403);
      });

      it("should throw if same cpf", () => {
         let clone = pactum.clone(dto);
         clone.email = "newemail@gmail.com";

         return pactum
            .spec()
            .post("/auth/signup")
            .withBody(clone)
            .expectStatus(403);
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
      const dto: EditUserDto = {
         name: "Patrick Matias",
         address: "Rua 5B, Jardim Nova Cidade",
         birthdate: new Date(2003, 1, 1),
         password: "1234",
      };

      it("should throw if no access token provided", () => {
         return pactum.spec().get("/users/me").expectStatus(401);
      });
      it("should get current user", () => {
         pactum.request.setDefaultHeaders("Authorization", "Bearer $S{userAt}");
         return pactum.spec().get("/users/me").expectStatus(200);
      });
      it("should edit user", () => {
         return pactum
            .spec()
            .patch("/users")
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains(dto.name)
            .expectBodyContains(dto.address)
            .expectBodyContains(dto.birthdate);
      });

      it("should edit password", () => {
         dto.newPassword = "2345";

         return pactum.spec().patch("/users").withBody(dto).expectStatus(200);
      });

      it("must throw if no password provided to edit", () => {
         delete dto.password, dto.newPassword;

         return pactum.spec().patch("/users").withBody(dto).expectStatus(400);
      });
   });

   describe("Operations", () => {
      var parentOperationId: number;

      it("should get an empty array of operations", () => {
         return pactum
            .spec()
            .get("/operations")
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
            .expectStatus(200)
            .expectJsonLike({ packages: "$V.length === 50" });
      });

      it("should create distinct children operations", async () => {
         const dto: CreateOperationDto = {
            name: "Big operation 1",
            value: 20000,
            billType: 50,
         };

         const response: Operation = await pactum
            .spec()
            .post("/operations")
            .withBody(dto)
            .expectStatus(201)
            .expectJsonLike({
               parentOperationId: "$V == null",
               packages: "$V.length === 0",
               children: "$V.length === 4",
            })
            .returns("res.body")
            .toss();

         parentOperationId = response.id;
      });

      it("should get children operations", async () => {
         const response: Operation[] = await pactum
            .spec()
            .post(`/operations/${parentOperationId}`)
            .expectStatus(201)
            .expectJsonLength(4)
            .returns("res.body")
            .toss();
         expect(response).toEqual(
            expect.arrayContaining([
               expect.objectContaining({
                  parentOperationId,
               }),
            ])
         );
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
            .withBody(updateDto)
            .expectStatus(200)
            .expectBodyContains(updateDto.name);
      });

      it("should delete simple operation", () => {
         return pactum
            .spec()
            .delete(`/operations/$S{firstOperationId}`)
            .expectStatus(200);
      });

      it("should delete operation with relationship", () => {
         return pactum
            .spec()
            .delete(`/operations/$S{relatedOperationId}`)
            .expectStatus(200);
      });
   });
});
