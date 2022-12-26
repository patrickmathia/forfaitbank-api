import { IsNotEmpty, IsInt, IsString, IsIn, IsOptional } from "class-validator";

export class CreateOperationDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsInt()
   @IsNotEmpty()
   value: number;

   @IsInt()
   @IsIn([10, 50, 100])
   @IsNotEmpty()
   billType: number;

   @IsString()
   @IsIn(["opened", "reserved", "closed"])
   @IsOptional()
   status?: string;
}
