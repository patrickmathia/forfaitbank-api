import { CreateManyOperationsDto } from "./dto/create-many-operations.dto";
import { CreateManyPackagesDto } from "./../package/dto/create-many-packages.dto";
import { PackageService } from "./../package/package.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";

@Injectable()
export class OperationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly pkg: PackageService
   ) {}
   MAX_OPERATION_VALUE = 5000;

   async create(userId: number, dto: CreateOperationDto) {
      const operation = await this.prisma.operation.create({
         data: {
            userId,
            ...dto,
         },
      });

      if (dto.value <= this.MAX_OPERATION_VALUE) {
         // create individual operation
         const pkgDto: CreateManyPackagesDto = {
            value: operation.value,
            billType: operation.billType,
            operationId: operation.id,
         };
         await this.pkg.createMany(pkgDto);

         // set status
         const op = await this.findOne(userId, operation.id);
         const OPENED_PACKAGE = (pkg) => pkg.status == "opened";
         if (op.packages.some(OPENED_PACKAGE)) {
            await this.update(userId, operation.id, {
               status: "reserved",
            });
         } else {
            await this.update(userId, operation.id, {
               status: "concluded",
            });
         }

         return await this.findOne(userId, operation.id);
      } else {
         // create parent operation with children
         let closedOperations = Math.round(
            dto.value / this.MAX_OPERATION_VALUE
         );
         let remainingOperationValue = Math.round(
            dto.value % this.MAX_OPERATION_VALUE
         );

         let child: CreateOperationDto = {
            name: "",
            value: this.MAX_OPERATION_VALUE,
            billType: dto.billType,
            parentOperationId: operation.id,
            status: "closed",
         };

         for (let i = closedOperations; i > 0; i--) {
            child.name = `${dto.name} - Sub-operação ${i}`;
            await this.create(userId, child);
         }

         if (remainingOperationValue > 0) {
            child.name = `${dto.name} - Sub-operação ${closedOperations + 1}`;
            child.value = remainingOperationValue;
            await this.create(userId, child);
         }

         // set status
         const op = await this.findOne(userId, operation.id);
         const RESERVED_OPERATION = (op) => op.status === "reserved";
         if (op.children.some(RESERVED_OPERATION)) {
            await this.update(userId, operation.id, {
               status: "reserved",
            });
         } else {
            await this.update(userId, operation.id, {
               status: "concluded",
            });
         }

         return await this.findOne(userId, operation.id);
      }
   }

   async findAll(userId: number) {
      return await this.prisma.operation.findMany({
         where: {
            userId,
         },
      });
   }

   async findOne(userId: number, operationId: number) {
      return await this.prisma.operation.findFirst({
         where: {
            id: operationId,
            userId,
         },
         include: {
            packages: { select: { id: true, status: true } },
            children: { select: { id: true, name: true, status: true } },
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
      });

      if (!operation) {
         throw new NotFoundException("Operation not found.");
      } else if (operation.userId !== userId) {
         throw new ForbiddenException("Access to resource denied.");
      }

      return this.prisma.operation.delete({
         where: {
            id: operationId,
         },
      });
   }
}
