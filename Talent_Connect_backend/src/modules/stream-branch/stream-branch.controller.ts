import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { StreamBranchService } from './stream-branch.service';
import { StreamBranch } from './stream-branch.entity';

@ApiTags('stream-branch')
@Controller('stream-branch')
export class StreamBranchController {
  constructor(private readonly service: StreamBranchService) { }

  @Public()
    @Get() findAll(
    @Query('program_id') programId?: string,
    @Query('qualification_id') qualificationId?: string,
  ) { return this.service.findAll(programId ? +programId : undefined, qualificationId ? +qualificationId : undefined); }
  @Public()
    @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<StreamBranch>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<StreamBranch>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
