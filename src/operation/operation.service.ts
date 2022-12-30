import { CreateSubOperationDto } from './dto/create-sub-operation.dto';
import { CreateManyPackagesDto } from "./../package/dto/create-many-packages.dto";
import { PackageService } from "./../package/package.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { Operation } from './entities/operation.entity';

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
         }
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
         let dtoArray: CreateSubOperationDto[] = []
         
         delete dto.value

         for (let i = closedOperations; i > 0; i--) {
            dtoArray.push({
               parentOperationId: operation.id,
               subId: i,
               value: this.MAX_OPERATION_VALUE,
               status: 'closed',
               ...dto
            })
         }

         if (remainingOperationValue > 0) {
            dtoArray.unshift({
               parentOperationId: operation.id,
               subId: closedOperations + 1,
               value: remainingOperationValue,
               status: 'reserved',
               ...dto
            })
         }

         await this.createMany(userId, dtoArray)

         // set status
         const op = await this.findOne(userId, operation.id);
         const RESERVED_OPERATION = (op) => op.status === "reserved";
         if (op.children.some(RESERVED_OPERATION)) {
            await this.update(userId, op.id, {
               status: "reserved",
            });
         } else {
            await this.update(userId, op.id, {
               status: "concluded",
            });
         }

         return await this.findOne(userId, operation.id);
      }
   }

   async createMany(userId: number, dto: CreateOperationDto[] | CreateSubOperationDto[]) {
      const dtosWithUserId = dto.map( d => ({...d, userId}))

      const operationsArray = await this.prisma.operation.createMany({
         data: dtosWithUserId
      })

      return operationsArray
   }

   async findAll(userId: number, where: { parentOperationId?: number }) {
      return await this.prisma.operation.findMany({
         where: {
            userId,
            ...where
         },
         select: {
            id: true,
            name: true,
            value: true,
            status: true,
            parentOperationId: true,
            subId: true,
            children: { select: { id: true } }
         }
      });
   }

   async findOne(userId: number, operationId: number): Promise<Operation> {
      return await this.prisma.operation.findFirst({
         where: {
            id: operationId,
            userId,
         },
         include: {
            packages: { select: { id: true, billType: true, billQuantity: true, status: true, color: true } },
            children: { select: { subId: true, name: true, status: true } },
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
         })
         
         return await this.prisma.operation.delete({
            where: { id : operation.id }
         })


      }
   }
}
