import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobRoleProgramMappingService } from './job-role-program-mapping.service';
import { JobRoleProgramMapping } from './job-role-program-mapping.entity';

@ApiTags('job-role-program-mapping')
@Controller('job-role-program-mapping')
export class JobRoleProgramMappingController {
  constructor(private readonly service: JobRoleProgramMappingService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<JobRoleProgramMapping>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<JobRoleProgramMapping>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
