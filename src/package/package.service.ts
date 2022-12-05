import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";

@Injectable()
export class PackageService {
   constructor(private readonly prisma: PrismaService) {}
   async create(dto: CreatePackageDto) {
   }

   findAll() {
      return `This action returns all package`;
   }

   findOne(id: number) {
      return `This action returns a #${id} package`;
   }

   update(id: number, dto: UpdatePackageDto) {
      return `This action updates a #${id} package`;
   }

   remove(id: number) {
      return `This action removes a #${id} package`;
   }
}
