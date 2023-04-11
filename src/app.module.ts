import { Module } from "@nestjs/common"
import { PrismaModule } from "./prisma/prisma.module"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { UserModule } from "./user/user.module"
import { OperationModule } from "./operation/operation.module"
import { DatabaseModule } from "./database/database.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === "test"
          ? "./test/.env.test"
          : "./prisma/.env.dev",
    }),
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
