import { Operation } from "./entities/operation.entity";
import { Package } from "../package/entities/package.entity";
import { ConfigService } from "@nestjs/config";
import { PackageService } from "./../package/package.service";
import { PrismaService } from "./../prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { OperationService } from "./operation.service";
import * as pactum from "pactum";
import { CreateOperationDto } from "./dto/create-operation.dto";

describe("OperationService", () => {
   let service: OperationService;
   let prisma: PrismaService;
   let userId: number;

   beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            OperationService,
            PrismaService,
            PackageService,
            ConfigService,
         ],
      }).compile();
      service = module.get<OperationService>(OperationService);
      prisma = module.get<PrismaService>(PrismaService);

      const mockUser = await prisma.user.create({
         data: {
            name: "mock",
            email: "mock@gmail.com",
            address: "mockland",
            cpf: "123.123.123-12",
            hash: "123",
            birthdate: new Date("2003-11-22"),
         },
      });

      userId = mockUser.id;
   });

   afterAll(async () => {
      await prisma.cleanDatabase();
   });

   it("should be defined", () => {
      expect(service).toBeDefined();
   });

   describe("createOperation", () => {
      let operation: Operation;

      it("should create a new operation with packages", async () => {
         const dto: CreateOperationDto = {
            name: "Test Operation 1",
            value: 1000,
            billType: 100,
         };

         operation = await service.create(userId, dto);

         expect(operation).toMatchObject<Operation>({
            name: "Test Operation 1",
            value: 1000,
            billType: 100,
            id: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            packages: expect.any(Array<Package>),
            userId: expect.any(Number),
         });
         expect(operation.packages).toHaveLength(10);

      });

      it("should be with valid package", async () => {
         expect(operation.packages[0]).toMatchObject<Package>({
            billType: expect.any(Number),
            billQuantity: expect.any(Number),
            status: expect.any(String),
            color: expect.any(String),
         });
      });

   });
});
