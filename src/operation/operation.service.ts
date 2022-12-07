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

   async create(userId: number, dto: CreateOperationDto) {
      const MAX_OPERATION_VALUE = 5000;

      const operation = await this.prisma.operation.create({
         data: {
            userId,
            ...dto,
         },
      });

      if (operation.value > MAX_OPERATION_VALUE) {
         await this.createChildrenOperations(operation.value, operation.id);
      } else {
         const _dto: CreateManyPackagesDto = {
            value: operation.value,
            billType: operation.billType,
            operationId: operation.id,
         };

         await this.pkg.createMany(_dto);
      }

      return this.findOne(userId, operation.id);
   }

   findAll(userId: number) {
      return this.prisma.operation.findMany({
         where: {
            userId,
         },
      });
   }

   findOne(userId: number, operationId: number) {
      return this.prisma.operation.findFirst({
         where: {
            id: operationId,
            userId,
         },
         include: { packages: { select: { id: true } } },
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

   async createChildrenOperations(value: number, operationId: number) {}
}
