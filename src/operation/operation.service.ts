import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class OperationService {
   constructor(private readonly prisma: PrismaService) {}

   async create(userId: number, dto: CreateOperationDto) {
      const MAX_OPERATION_VALUE = 5000;

      const operation = await this.prisma.operation.create({
         data: {
            userId,
            ...dto,
         },
      });


      // for (let i = opEntity.closedChildrenQuantity; i > 0; i--) {
      //    dto.name = `${operation.name} - Sub-operação ${i}`;
      //    await this.prisma.operation.create({
      //       data: {
      //          userId,
      //          ...closedOperation,
      //       },
      //    });
      // }

      return operation;
   }

   findAll(userId: number) {
      return this.prisma.operation.findMany({
         where: {
            userId,
         },
      });
   }

   findOne(userId: number, operationId: number) {
      return this.prisma.operation.findMany({
         where: {
            id: operationId,
            userId,
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
