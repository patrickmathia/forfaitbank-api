import { JwtGuard } from './../auth/guard/jwt.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OperationService } from './operation.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

@UseGuards(JwtGuard)
@Controller('operations')
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Post()
  create(@Body() dto: CreateOperationDto) {
    return this.operationService.create(dto);
  }

  @Get()
  findAll() {
    return this.operationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOperationDto) {
    return this.operationService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operationService.remove(+id);
  }
}
