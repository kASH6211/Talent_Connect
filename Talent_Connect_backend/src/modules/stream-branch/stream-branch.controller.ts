import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { StreamBranchService } from './stream-branch.service';

@ApiTags('stream-branch')
@Controller('stream-branch')
export class StreamBranchController {
  constructor(private readonly service: StreamBranchService) { }

  @Public()
  @Get()
  findAll(
    @Query('qualification_id') qualificationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    let qIds: number | number[] | undefined;
    if (qualificationId) {
      const parts = qualificationId.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        qIds = parts.map(p => +p).filter(n => !isNaN(n));
      } else if (parts.length === 1) {
        qIds = +parts[0];
        if (isNaN(qIds)) qIds = undefined;
      }
    }

    return this.service.findAll(
      qIds,
      page ? +page : undefined,
      limit,
      search,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, any>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
