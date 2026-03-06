import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { JobRoleQualificationMappingService } from './job-role-qualification-mapping.service';
import { JobRoleQualificationMapping } from './job-role-qualification-mapping.entity';

@ApiTags('job-role-qualification-mapping')
@Controller('job-role-qualification-mapping')
export class JobRoleQualificationMappingController {
  constructor(private readonly service: JobRoleQualificationMappingService) { }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(page, limit);
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<JobRoleQualificationMapping>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<JobRoleQualificationMapping>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
