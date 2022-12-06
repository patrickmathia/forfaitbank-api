import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
@Module({
  providers: [PackageService]
})
export class PackageModule {}
