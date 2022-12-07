import { IsInt, IsIn, IsNotEmpty } from "class-validator";

export class CreateManyPackagesDto {
   @IsInt()
   @IsIn([10, 50, 100])
   @IsNotEmpty()
   billType: number;

   @IsInt()
   @IsNotEmpty()
   value: number;

   @IsInt()
   @IsNotEmpty()
   operationId: number;
}
