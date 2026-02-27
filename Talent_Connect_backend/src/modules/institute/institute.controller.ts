import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Public } from '../../auth/public.decorator';
import { InstituteService } from './institute.service';
import type { InstituteSearchQuery } from './institute.service';
import { Institute } from './institute.entity';

@ApiTags('institute')
@Controller('institute')
export class InstituteController {
  constructor(private readonly service: InstituteService) { }

  @Get() findAll() { return this.service.findAll(); }

  /** Filtered institute search — GET /api/institute/search */
  @Public()
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

  @Public()
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<Institute>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Institute>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  /** Upload endpoint */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    try {
      const result = await this.service.importInstitutes(file.buffer);
      if (!result.success && result.errorFile) {
        // Send back the error excel file
        res.setHeader('Content-Disposition', 'attachment; filename="ImportErrors.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('X-Import-Message', encodeURIComponent(result.message));
        res.setHeader('Access-Control-Expose-Headers', 'X-Import-Message, Content-Disposition');
        return res.send(result.errorFile);
      }
      return res.json({ message: result.message });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to process Excel file' });
    }
  }
}
