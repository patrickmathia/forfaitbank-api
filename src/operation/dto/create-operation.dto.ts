import {
   IsNotEmpty,
   IsInt,
   IsString,
   Max,
   IsIn,
   IsOptional,
   IsArray,
} from "class-validator";

export class CreateOperationDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsInt()
   @Max(5000)
   @IsNotEmpty()
   value: number;

   @IsInt()
   @IsIn([10, 50, 100])
   @IsNotEmpty()
   billType: number;

   @IsString()
   @IsIn(["opened", "reserved", "closed"])
   @IsNotEmpty()
   status: string;

   @IsInt()
   @IsOptional()
   parentId?: number;
}
