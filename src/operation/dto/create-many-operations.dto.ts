import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateOperationDto } from './create-operation.dto';
export class CreateManyOperationsDto extends CreateOperationDto{
   @IsInt()
   @IsNotEmpty()
   userId: number;
}