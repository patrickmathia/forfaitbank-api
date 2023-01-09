import { CreateNestedPackageDto } from "./../package/dto/create-nested-package.dto";
import { CreateSubOperationDto } from "./dto/create-sub-operation.dto";
import { PackageService } from "./../package/package.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { Operation } from "./entities/operation.entity";

@Injectable()
export class OperationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly packageService: PackageService
   ) {}
   private readonly MAX_OPERATION_VALUE = 5000;

   async create(userId: number, dto: CreateOperationDto) {
      const data = {
         userId,
         ...dto,
         packages: undefined,
         children: undefined,
         status: 'opened',
      };

      const needSubOperations = dto.value > this.MAX_OPERATION_VALUE;

      if (needSubOperations) {
         const subOperations = this.nestedCreateMany(userId, dto);
         data.children = {
            createMany: { data: subOperations },
         };
      } else {
         const packages = this.packageService.nestedCreateMany({ ...dto });
         data.packages = {
            createMany: { data: packages },
         };
      }

      const children = needSubOperations
         ? data.children.createMany.data
         : data.packages.createMany.data;

      data.status = this.setOperationStatus(children);

      // create individual operation
      const operation = await this.prisma.operation.create({
         data,
         include: {
            packages: true,
            children: true,
         },
      });

      return operation;
   }

   private nestedCreateMany(
      userId: number,
      dto: CreateOperationDto
   ): CreateSubOperationDto[] {
      const remainingValue = Math.round(dto.value % this.MAX_OPERATION_VALUE);
      let closedOperations = Math.round(dto.value / this.MAX_OPERATION_VALUE);
      const dtoArray: CreateOperationDto[] = [];

      while (closedOperations) {
         dtoArray.push(this.generateConcludedOperation({ ...dto }));
         closedOperations--;
      }

      if (remainingValue) {
         dtoArray.unshift(
            this.generateReservedOperation({ ...dto, remainingValue })
         );
      }

      const operations: CreateSubOperationDto[] = dtoArray.map((op) => ({
         ...op,
         userId,
      }));

      return operations;
   }

   private generateConcludedOperation(dto: CreateOperationDto) {
      return {
         name: dto.name,
         billType: dto.billType,
         value: this.MAX_OPERATION_VALUE,
         status: "concluded",
      };
   }

   private generateReservedOperation(
      dto: CreateOperationDto & { remainingValue: number }
   ) {
      return {
         name: dto.name,
         billType: dto.billType,
         value: dto.remainingValue,
         status: "reserved",
      };
   }

   private setOperationStatus(
      array: CreateNestedPackageDto[] | CreateSubOperationDto[]
   ) {
      const openedPackageOrReservedOperation = item => 
         item.status === "opened" || item.status === "reserved";

      if (array.some(openedPackageOrReservedOperation)) {
         return "reserved";
      } else {
         return "concluded";
      }
   }

   async createMany(
      userId: number,
      dto: CreateOperationDto[] | CreateSubOperationDto[]
   ) {
      const dtosWithUserId = dto.map((d) => ({ ...d, userId }));

      const operationsArray = await this.prisma.operation.createMany({
         data: dtosWithUserId,
      });

      return operationsArray;
   }

   async findAll(userId: number) {
      return await this.prisma.operation.findMany({
         where: {
            userId,
         },
         select: {
            id: true,
            name: true,
            value: true,
            status: true,
            parentOperationId: true,
            children: { select: { id: true } },
         },
      });
   }

   async findChildren(userId: number, parentOperationId: number) {
      return await this.prisma.operation.findMany({
         where: {
            userId,
            parentOperationId,
         },
         select: {
            id: true,
            name: true,
            value: true,
            status: true,
            parentOperationId: true,
         },
      });
   }

   async findOne(userId: number, operationId: number): Promise<Operation> {
      return await this.prisma.operation.findFirst({
         where: {
            id: operationId,
            userId,
         },
         include: {
            packages: {
               select: {
                  id: true,
                  billType: true,
                  billQuantity: true,
                  status: true,
                  color: true,
               },
            },
            children: { select: { name: true, status: true } },
         },
      });
   }

   async update(userId: number, operationId: number, dto: UpdateOperationDto) {
      const operation = await this.prisma.operation.findFirst({
         where: {
            id: operationId,
         },
      });

      if (!operation) {
         throw new NotFoundException("Operation not found.");
      } else if (operation.userId !== userId) {
         throw new ForbiddenException("Access to resource denied.");
      }

      return this.prisma.operation.update({
         where: {
            id: operationId,
         },
         data: {
            ...dto,
         },
      });
   }

   async remove(userId: number, operationId: number) {
      const operation = await this.prisma.operation.findFirst({
         where: {
            id: operationId,
         },
         include: { children: { select: { id: true } } },
      });

      if (!operation) {
         throw new NotFoundException("Operation not found.");
      } else if (operation.userId !== userId) {
         throw new ForbiddenException("Access to resource denied.");
      }

      if (operation.parentOperationId == null && operation.value <= 5000) {
         return this.prisma.$transaction([
            this.prisma.package.deleteMany({
               where: { operationId: operation.id },
            }),
            this.prisma.operation.delete({
               where: { id: operation.id },
            }),
         ]);
      } else {
         // delete children operations and packages
         operation.children.forEach(async (op) => {
            await this.prisma.package.deleteMany({
               where: { operationId: op.id },
            });
            await this.prisma.operation.delete({
               where: { id: op.id },
            });
         });

         return await this.prisma.operation.delete({
            where: { id: operation.id },
         });
      }
   }
}
