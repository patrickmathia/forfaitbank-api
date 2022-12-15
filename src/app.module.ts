import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { OperationModule } from './operation/operation.module';
import { TestingModule } from './testing/testing.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      AuthModule,
      UserModule,
      OperationModule,
      TestingModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
