import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstituteProgramMappingService } from './institute-program-mapping.service';
import { InstituteProgramMapping } from './institute-program-mapping.entity';

@ApiTags('institute-program-mapping')
@Controller('institute-program-mapping')
export class InstituteProgramMappingController {
  constructor(private readonly service: InstituteProgramMappingService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<InstituteProgramMapping>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteProgramMapping>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
