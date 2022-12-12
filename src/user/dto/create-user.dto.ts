import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   password: string;

   @IsString()
   @IsNotEmpty()
   address: string;

   @IsString()
   @IsNotEmpty()
   cpf: string;

   @IsDateString()
   @IsNotEmpty()
   birthdate: string;
}
