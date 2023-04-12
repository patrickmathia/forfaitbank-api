import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { OperationModule } from './../operation/operation.module';
import { AuthModule } from './../auth/auth.module';

@Module({
  imports: [AuthModule, OperationModule],
  controllers: [GuestController],
  providers: [GuestService]
})
export class GuestModule {}
