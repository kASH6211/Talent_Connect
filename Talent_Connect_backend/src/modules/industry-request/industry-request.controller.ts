import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { IndustryRequestService } from './industry-request.service';
import { IndustryRequest } from './industry-request.entity';

@ApiTags('industry-request')
@Controller('industry-request')
export class IndustryRequestController {
  constructor(private readonly service: IndustryRequestService) { }

  @Get('count') count() { return this.service.count(); }
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(page, limit);
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<IndustryRequest>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<IndustryRequest>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
