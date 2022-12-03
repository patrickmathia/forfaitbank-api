import {
   IsHexColor,
   IsIn,
   IsInt,
   IsNotEmpty,
   IsString,
} from "class-validator";

export class CreatePackageDto {
   @IsInt()
   @IsIn([10, 50, 100])
   @IsNotEmpty()
   billType: number;

   @IsInt()
   @IsNotEmpty()
   billQuantity: number;

   @IsString()
   @IsIn(["opened", "closed"])
   @IsNotEmpty()
   status: string;

   @IsHexColor()
   @IsNotEmpty()
   color?: string;
}
