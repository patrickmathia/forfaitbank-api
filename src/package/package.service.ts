import type { CreateNestedPackageDto } from "./dto/create-nested-package.dto";
import type { CreateManyPackagesDto } from "./dto/create-many-packages.dto";
import type { PackageEntityProps } from "src/types";
import type { OperationBillType } from "@prisma/client";
import { PackageEntity } from "./entities/package.entity";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePackageDto } from "./dto/create-package.dto";
import { MaxBillQuantity } from "@/utils/constants";
import { billTypeToNumber } from "@/utils";

@Injectable()
export class PackageService {
   constructor(private readonly prisma: PrismaService) {}

   create({ value, billType }: { value: number, billType: OperationBillType }) {
      const billValue = billTypeToNumber(billType)
      const billQuantity = value / billValue
      const props: PackageEntityProps = { billType, billQuantity }
      
      if (billQuantity > MaxBillQuantity) {
         return this.createMany(props)
      }
      
      const data = new PackageEntity(props)
      return this.prisma.package.create({data})
   }

   private createMany(props: PackageEntityProps) {
      const data: PackageEntity[] = []

      while(props.billQuantity >= MaxBillQuantity) {
         data.push(new PackageEntity({ ...props, billQuantity: MaxBillQuantity }))
         props.billQuantity -= MaxBillQuantity
      }

      if (props.billQuantity) data.push(new PackageEntity(props))

      return this.prisma.package.createMany({data})
   }

   findOne(packageId: number) {
      return this.prisma.package.findFirst({
         where: { id: packageId },
      });
   }

   remove(packageId: number) {
      return this.prisma.package.delete({
         where: { id: packageId },
      });
   }
   
   // findAll(operationId: number) {
   //    return this.prisma.package.findMany({
   //       where: { operationId },
   //    });
   // }


   // /////////////////////////////

   // nestedCreateMany(args: { value: number; billType: number }) {
   //    const remainingBills = Math.round(args.value % args.billType);
   //    let totalClosedPackages = Math.round(args.value / args.billType);
   //    let packages: CreateNestedPackageDto[] = [];

   //    while (totalClosedPackages > 0) {
   //       packages.push(this.generateClosedPackage({ billType: args.billType }));
   //       totalClosedPackages--;
   //    }

   //    if (remainingBills) {
   //       packages.push(
   //          this.generateOpenedPackage({
   //             billType: args.billType,
   //             billQuantity: remainingBills,
   //          })
   //       );
   //    }

   //    return packages;
   // }

   // generateClosedPackage(
   //    dto: Partial<CreatePackageDto>
   // ): CreatePackageDto | CreateNestedPackageDto {
   //    return {
   //       billType: dto.billType,
   //       billQuantity: this.MAX_BILL_QUANTITY,
   //       operationId: dto.operationId,
   //       status: "closed",
   //       color: this.generateRandomHexColor(),
   //    };
   // }

   // generateOpenedPackage(
   //    dto: Partial<CreatePackageDto>
   // ): CreatePackageDto | CreateNestedPackageDto {
   //    return {
   //       billType: dto.billType,
   //       billQuantity: dto.billQuantity,
   //       operationId: dto.operationId,
   //       status: "opened",
   //       color: this.generateRandomHexColor(),
   //    };
   // }
}
