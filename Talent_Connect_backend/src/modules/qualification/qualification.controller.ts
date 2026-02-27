import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { QualificationService } from './qualification.service';
import { Qualification } from './qualification.entity';

@ApiTags('qualification')
@Controller('qualification')
export class QualificationController {
  constructor(private readonly service: QualificationService) {}

  @Public()
    @Get() findAll() { return this.service.findAll(); }
  @Public()
    @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<Qualification>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Qualification>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
