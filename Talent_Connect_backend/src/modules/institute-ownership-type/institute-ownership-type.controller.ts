import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstituteOwnershipTypeService } from './institute-ownership-type.service';
import { InstituteOwnershipType } from './institute-ownership-type.entity';

@ApiTags('institute-ownership-type')
@Controller('institute-ownership-type')
export class InstituteOwnershipTypeController {
  constructor(private readonly service: InstituteOwnershipTypeService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<InstituteOwnershipType>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteOwnershipType>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
