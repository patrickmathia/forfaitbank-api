import { Module } from '@nestjs/common';
import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';
import { PackageService } from '../package/package.service';

@Module({
  controllers: [OperationController],
  providers: [OperationService, PackageService],
  exports: [OperationService]
})
export class OperationModule {}
