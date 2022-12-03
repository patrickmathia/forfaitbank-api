import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PackageModule } from './package/package.module';
import { OperationModule } from './operation/operation.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      AuthModule,
      UserModule,
      PackageModule,
      OperationModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
