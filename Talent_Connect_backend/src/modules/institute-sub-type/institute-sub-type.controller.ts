import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstituteSubTypeService } from './institute-sub-type.service';
import { InstituteSubType } from './institute-sub-type.entity';

@ApiTags('institute-sub-type')
@Controller('institute-sub-type')
export class InstituteSubTypeController {
  constructor(private readonly service: InstituteSubTypeService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<InstituteSubType>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteSubType>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
