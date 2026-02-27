import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DistrictService } from './district.service';
import { District } from './district.entity';

@ApiTags('district')
@Controller('district')
export class DistrictController {
  constructor(private readonly service: DistrictService) { }

  @Public()
    @Get() findAll(@Query('state_id') stateId?: number) { return this.service.findAll(stateId); }
  @Public()
    @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<District>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<District>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
