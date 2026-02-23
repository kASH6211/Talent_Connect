import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { InstituteService } from './institute.service';
import type { InstituteSearchQuery } from './institute.service';
import { Institute } from './institute.entity';

@ApiTags('institute')
@Controller('institute')
export class InstituteController {
  constructor(private readonly service: InstituteService) { }

  @Get() findAll() { return this.service.findAll(); }

  /** Filtered institute search — GET /api/institute/search */
  @Get('search')
  @ApiQuery({ name: 'district_ids', required: false })
  @ApiQuery({ name: 'type_ids', required: false })
  @ApiQuery({ name: 'ownership_ids', required: false })
  @ApiQuery({ name: 'qualification_ids', required: false })
  @ApiQuery({ name: 'program_ids', required: false })
  @ApiQuery({ name: 'stream_ids', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['name', 'student_count'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  search(@Query() q: InstituteSearchQuery) { return this.service.search(q); }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<Institute>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Institute>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
