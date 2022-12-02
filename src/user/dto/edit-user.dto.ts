import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class EditUserDto {
   @IsString()
   @IsOptional()
   name?: string;

   @IsEmail()
   @IsOptional()
   email?: string;

   @IsString()
   @IsOptional()
   address?: string;

   @IsString()
   @IsOptional()
   cpf?: string;

   @IsDateString()
   @IsOptional()
   birthdate?: Date;
}
