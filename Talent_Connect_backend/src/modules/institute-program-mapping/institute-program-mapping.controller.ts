import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstituteProgramMappingService } from './institute-program-mapping.service';
import { InstituteProgramMapping } from './institute-program-mapping.entity';

@ApiTags('institute-program-mapping')
@Controller('institute-program-mapping')
export class InstituteProgramMappingController {
  constructor(private readonly service: InstituteProgramMappingService) { }

  @Get() findAll(@Req() req: any) { return this.service.findAll(req.user); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.service.findOne(id, req.user); }
  @Post() create(@Body() dto: Partial<InstituteProgramMapping>, @Req() req: any) { return this.service.create(dto, req.user); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteProgramMapping>, @Req() req: any) { return this.service.update(id, dto, req.user); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.service.remove(id, req.user); }
}
