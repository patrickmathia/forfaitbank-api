import { CreateManyPackagesDto } from "./dto/create-many-packages.dto";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePackageDto } from "./dto/create-package.dto";
import { CreateNestedPackageDto } from "./dto/create-nested-package.dto";

@Injectable()
export class PackageService {
   constructor(private readonly prisma: PrismaService) {}
   private readonly MAX_BILL_QUANTITY = 50;

   async createMany(dto: CreateManyPackagesDto) {
      let dtoArray = this.createDtoArray(dto);

      const pkgArray = this.prisma.package.createMany({
         data: [...dtoArray],
      });

      return pkgArray;
   }

   create(dto: CreatePackageDto) {
      const pkg = this.prisma.package.create({
         data: {
            ...dto,
            color: this.generateRandomHexColor(),
         },
      });

      return pkg;
   }

   findAll(operationId: number) {
      return this.prisma.package.findMany({
         where: { operationId },
      });
   }

   findOne(packageId: number, operationId: number) {
      return this.prisma.package.findFirst({
         where: { id: packageId, operationId },
      });
   }

   remove(packageId: number) {
      return this.prisma.package.delete({
         where: { id: packageId },
      });
   }

   createDtoArray(dto: CreateManyPackagesDto): CreatePackageDto[] {
      const MAX_BILL_QUANTITY = 50;
      let dtoArray: CreatePackageDto[] = [];
      let totalClosedPackages = Math.round(dto.value / dto.billType);
      let remainingBills = Math.round(dto.value % dto.billType);

      let pkg: CreatePackageDto = {
         billType: dto.billType,
         billQuantity: MAX_BILL_QUANTITY,
         operationId: dto.operationId,
         status: "closed",
         color: this.generateRandomHexColor(),
      };

      for (let i = totalClosedPackages; i > 0; i--) {
         dtoArray.push({
            ...pkg,
            color: this.generateRandomHexColor(),
         });
      }

      // generate remaining package
      if (remainingBills > 0) {
         pkg.billQuantity = remainingBills;
         pkg.status = "opened";
         dtoArray.push({
            ...pkg,
            color: this.generateRandomHexColor(),
         });
      }

      return dtoArray;
   }

   nestedCreateMany(value: number, billType: number): CreateNestedPackageDto[] {
      const remainingBills = Math.round(value % billType);
      let totalClosedPackages = Math.round(value / billType);
      let packages: CreateNestedPackageDto[] = [];

      while (totalClosedPackages > 0) {
         packages.push(this.generateClosedPackage({ billType }));
         totalClosedPackages--;
      }

      if (remainingBills) {
         packages.push(
            this.generateOpenedPackage({
               billType,
               billQuantity: remainingBills,
            })
         );
      }

      return packages;
   }

   generateClosedPackage(
      dto: Partial<CreatePackageDto>
   ): CreatePackageDto | CreateNestedPackageDto {
      return {
         billType: dto.billType,
         billQuantity: this.MAX_BILL_QUANTITY,
         operationId: dto.operationId,
         status: "closed",
         color: this.generateRandomHexColor(),
      };
   }

   generateOpenedPackage(
      dto: Partial<CreatePackageDto>
   ): CreatePackageDto | CreateNestedPackageDto {
      return {
         billType: dto.billType,
         billQuantity: dto.billQuantity,
         operationId: dto.operationId,
         status: "opened",
         color: this.generateRandomHexColor(),
      };
   }

   private generateRandomHexColor(): string {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return "#" + n.slice(0, 6);
   }
}
