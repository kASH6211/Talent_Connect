import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IndustryTrainingPlacementService } from './industry-training-placement.service';
import { IndustryTrainingPlacement } from './industry-training-placement.entity';

@ApiTags('industry-training-placement')
@Controller('industry-training-placement')
export class IndustryTrainingPlacementController {
  constructor(private readonly service: IndustryTrainingPlacementService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<IndustryTrainingPlacement>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<IndustryTrainingPlacement>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
