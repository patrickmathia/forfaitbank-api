import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateOperationDto } from './create-operation.dto';

export class CreateSubOperationDto extends CreateOperationDto{
   @IsInt()
   @IsNotEmpty()
   parentOperationId: number;

   @IsInt()
   @IsNotEmpty()
   subId: number;
}