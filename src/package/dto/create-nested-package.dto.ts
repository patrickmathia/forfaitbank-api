import {
   IsHexColor,
   IsIn,
   IsInt,
   IsNotEmpty,
   IsString,
   Max,
} from "class-validator";

export class CreateNestedPackageDto {
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
   @IsNotEmpty()
   status: string;

   @IsHexColor()
   @IsNotEmpty()
   color: string;
}
