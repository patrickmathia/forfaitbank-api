import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateOperationDto {
   @IsString()
   @IsOptional()
   name?: string;

   @IsString()
   @IsIn(["opened", "reserved", "closed"])
   @IsOptional()
   status?: string;
}
