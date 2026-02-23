import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstituteEnrollmentService } from './institute-enrollment.service';
import { InstituteEnrollment } from './institute-enrollment.entity';

@ApiTags('institute-enrollment')
@Controller('institute-enrollment')
export class InstituteEnrollmentController {
  constructor(private readonly service: InstituteEnrollmentService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<InstituteEnrollment>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteEnrollment>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
