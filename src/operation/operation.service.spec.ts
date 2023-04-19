import type { Operation } from "@prisma/client";
import { Package } from "../package/entities/package.entity";
import { ConfigService } from "@nestjs/config";
import { PackageService } from "./../package/package.service";
import { PrismaService } from "./../prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { OperationService } from "./operation.service";
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

   describe("should create operation", () => {
      let operation;

      it("concluded with packages", async () => {
         const dto: CreateOperationDto = {
            name: "Test Operation 1",
            value: 1000,
            billType: 100,
         };

         operation = await service.create(userId, dto);

         expect(operation).toMatchObject<Operation & { packages: Package[] }>({
            ...dto,
            id: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            packages: expect.any(Array<Package>),
            userId: expect.any(Number),
            status: "concluded",
            parentOperationId: 0
         });
         expect(operation.packages).toHaveLength(10);
      });

      it("with valid package", async () => {
         expect(operation.packages[0]).toMatchObject<Package>({
            billType: expect.any(Number),
            billQuantity: expect.any(Number),
            status: expect.any(String),
            color: expect.any(String),
            operationId: operation.id
         });
      });

      it("reserved with packages", async () => {
         const dto: CreateOperationDto = {
            name: "Reserved Operation 1",
            value: 1001,
            billType: 10,
         };

         operation = await service.create(userId, dto);

         expect(operation).toMatchObject({
            ...dto,
            userId: expect.any(Number),
            status: "reserved",
         });

         expect(operation.packages).toHaveLength(101);

         const lastChild = operation.packages[100];
         expect(lastChild).toMatchObject({
            billQuantity: 1,
            status: 'opened'
         })

         const penultimateChild = operation.packages[99];
         expect(penultimateChild).toMatchObject({
            billQuantity: 50,
            status: 'closed'
         })
      })

      it("concluded with sub-operations", async () => {
         const dto: CreateOperationDto = {
            name: "Test Parent Operation 1",
            value: 20000,
            billType: 100,
         };

         operation = await service.create(userId, dto);
         
         expect(operation).toMatchObject({
            ...dto,
            status: "concluded",
         });
         expect(operation.children).toHaveLength(4);
         expect(operation.packages).toHaveLength(0);

         const lastChild = operation.children[3];
         
         expect(lastChild).toMatchObject({
            value: 5000,
            parentOperationId: operation.id,
            status: "concluded",
         })
      });

      it("reserved with sub-operations", async () => {
         const dto: CreateOperationDto = {
            name: "Test Parent Operation 2",
            value: 12345,
            billType: 50,
         };

         operation = await service.create(userId, dto);

         expect(operation).toMatchObject({
            ...dto,
            status: "reserved",
         });
         expect(operation.children).toHaveLength(3);
         expect(operation.packages).toHaveLength(0);
         
         const reservedChild = operation.children[0];

         expect(reservedChild).toMatchObject({
            value: 2345,
            parentOperationId: operation.id,
            status: "reserved",
         })
      })


   });
});
