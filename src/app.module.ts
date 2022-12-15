import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { OperationModule } from './operation/operation.module';
import { DatabaseModule } from './database/database.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      AuthModule,
      UserModule,
      OperationModule,
      DatabaseModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
