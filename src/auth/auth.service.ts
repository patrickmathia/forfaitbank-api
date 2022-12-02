import { AuthDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./../prisma/prisma.service";
import { CreateUserDto } from "./../user/dto/create-user.dto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
   constructor(
      private prisma: PrismaService,
      private config: ConfigService,
      private jwt: JwtService
   ) {}

   async signup(dto: CreateUserDto) {
      // generate the password
      const hash = await argon.hash(dto.password);

      delete dto.password;

      // save the new user in the db
      try {
         const user = await this.prisma.user.create({
            data: {
               hash,
               ...dto,
            },
         });

         return this.signToken(user.id, user.email);
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            // error code referring to the reuse of a unique field (in this case, email)
            if (error.code === "P2002")
               throw new ForbiddenException("Credentials taken.");
         }
         throw error;
      }
   }

   async signin(dto: AuthDto) {
      // find the user by email
      const user = await this.prisma.user.findFirst({
         where: {
            email: dto.email,
         },
      });
      // if user does not exist throw exception
      if (!user) throw new ForbiddenException("Incorrect credentials.");

      // compare passwords
      const pwMatches = await argon.verify(user.hash, dto.password);

      // if password incorrect throw exception
      if (!pwMatches) throw new ForbiddenException("Incorrect password.");

      return this.signToken(user.id, user.email);
   }

   async signToken(
      userId: number,
      email: string
   ): Promise<{ access_token: string }> {
      const payload = {
         sub: userId,
         email,
      };

      const secret = this.config.get("JWT_SECRET");

      const token = await this.jwt.signAsync(payload, {
         expiresIn: "1d",
         secret: secret,
      });

      return {
         access_token: token,
      };
   }
}
