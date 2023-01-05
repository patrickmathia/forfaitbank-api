import { IsInt, IsNotEmpty } from "class-validator";
import { CreateNestedPackageDto } from "./create-nested-package.dto";

export class CreatePackageDto extends CreateNestedPackageDto {
   @IsInt()
   @IsNotEmpty()
   operationId: number;
}
