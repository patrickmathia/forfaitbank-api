import {
   IsHexColor,
   IsIn,
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Max,
} from "class-validator";

export class CreatePackageDto {
   @IsInt()
   @IsIn([10, 50, 100])
   @IsNotEmpty()
   billType: number;

   @IsInt()
   @Max(50)
   @IsNotEmpty()
   billQuantity: number;

   @IsString()
   @IsIn(["opened", "closed"])
   @IsOptional()
   status?: string;

   @IsHexColor()
   @IsOptional()
   color?: string;

   @IsInt()
   @IsNotEmpty()
   operationId: number;
}
