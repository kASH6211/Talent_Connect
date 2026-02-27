import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StreamBranchQualificationMappingService } from './stream-branch-qualification-mapping.service';
import { StreamBranchQualificationMapping } from './stream-branch-qualification-mapping.entity';

@ApiTags('stream-branch-qualification-mapping')
@Controller('stream-branch-qualification-mapping')
export class StreamBranchQualificationMappingController {
    constructor(private readonly service: StreamBranchQualificationMappingService) { }

    @Get() findAll(@Query('qualification_id') qualificationId?: number) { return this.service.findAll(qualificationId); }
    @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
    @Post() create(@Body() dto: Partial<StreamBranchQualificationMapping>) { return this.service.create(dto); }
    @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<StreamBranchQualificationMapping>) { return this.service.update(id, dto); }
    @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
