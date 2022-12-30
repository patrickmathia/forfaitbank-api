import { JwtGuard } from "./../auth/guard/jwt.guard";
import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Delete,
   UseGuards,
} from "@nestjs/common";
import { OperationService } from "./operation.service";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { GetUser } from "../auth/decorator";

@UseGuards(JwtGuard)
@Controller("operations")
export class OperationController {
   constructor(private readonly operationService: OperationService) {}

   @Post()
   create(@GetUser("id") userId: number, @Body() dto: CreateOperationDto) {
      return this.operationService.create(userId, dto);
   }

   @Get()
   findAll(
      @GetUser("id") userId: number,
      @Body() where: { parentOperationId?: number } = {}
   ) {
      return this.operationService.findAll(userId, where);
   }

   @Get(":id")
   findOne(@GetUser("id") userId: number, @Param("id") id: string) {
      return this.operationService.findOne(userId, +id);
   }

   @Patch(":id")
   update(
      @GetUser("id") userId: number,
      @Param("id") id: string,
      @Body() dto: UpdateOperationDto
   ) {
      return this.operationService.update(userId, +id, dto);
   }

   @Delete(":id")
   remove(@GetUser("id") userId: number, @Param("id") id: string) {
      return this.operationService.remove(userId, +id);
   }
}
