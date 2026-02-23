import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProgramQualificationMappingService } from './program-qualification-mapping.service';
import { ProgramQualificationMapping } from './program-qualification-mapping.entity';

@ApiTags('program-qualification-mapping')
@Controller('program-qualification-mapping')
export class ProgramQualificationMappingController {
  constructor(private readonly service: ProgramQualificationMappingService) { }

  @Get() findAll(@Query('qualification_id') qualificationId?: number) { return this.service.findAll(qualificationId); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<ProgramQualificationMapping>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<ProgramQualificationMapping>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
