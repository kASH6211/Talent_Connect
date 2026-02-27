import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InstituteQualificationMappingService } from './institute-qualification-mapping.service';
import { InstituteQualificationMapping } from './institute-qualification-mapping.entity';

@ApiTags('institute-qualification-mapping')
@Controller('institute-qualification-mapping')
export class InstituteQualificationMappingController {
    constructor(
        private readonly service: InstituteQualificationMappingService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) { }

    /** Returns distinct stream branches that have mappings in mapping_institute_qualification */
    @Public()
    @Get('streams-in-use')
    async streamsInUse() {
        const rows = await this.dataSource.query(`
            SELECT DISTINCT msb."stream_branch_Id", msb.stream_branch_name
            FROM mapping_institute_qualification miq
            INNER JOIN master_stream_branch msb ON msb."stream_branch_Id" = miq."stream_branch_Id"
            WHERE miq.is_active = 'Y' AND miq."stream_branch_Id" IS NOT NULL
            ORDER BY msb.stream_branch_name
        `);
        return rows;
    }

    @Public()
    @Get() findAll(@Req() req: any) { return this.service.findAll(req.user); }
    @Public()
    @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
    @Post() create(@Body() dto: Partial<InstituteQualificationMapping>, @Req() req: any) { return this.service.create(dto, req.user); }
    @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<InstituteQualificationMapping>, @Req() req: any) { return this.service.update(id, dto, req.user); }
    @Delete(':id') remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.service.remove(id, req.user); }
}
