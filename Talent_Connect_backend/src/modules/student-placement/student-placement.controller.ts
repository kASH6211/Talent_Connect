import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentPlacementService } from './student-placement.service';
import { StudentPlacement } from './student-placement.entity';

@ApiTags('student-placement')
@Controller('student-placement')
export class StudentPlacementController {
  constructor(private readonly service: StudentPlacementService) { }

  @Get('count') count() { return this.service.count(); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<StudentPlacement>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<StudentPlacement>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
