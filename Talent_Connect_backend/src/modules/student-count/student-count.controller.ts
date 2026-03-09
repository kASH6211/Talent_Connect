import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Req, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentCountService } from './student-count.service';
import { StudentCount } from './student-count.entity';

@ApiTags('student-count')
@Controller('student-count')
export class StudentCountController {
    constructor(private readonly service: StudentCountService) { }

    @Get()
    findAll(
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('institute_id') instituteId?: number,
    ) {
        return this.service.findAll(req.user, page, limit, search, instituteId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: Partial<StudentCount>) {
        return this.service.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<StudentCount>) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }

    @Post('bulk')
    bulkSave(@Body() dtos: Partial<StudentCount>[]) {
        return this.service.bulkSave(dtos);
    }
}
