import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MasterCourseDurationService } from './master-course-duration.service';
import { MasterCourseDuration } from './master-course-duration.entity';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('master-course-duration')
@Controller('master-course-duration')
export class MasterCourseDurationController {
    constructor(private readonly masterCourseDurationService: MasterCourseDurationService) { }

    @Public()
    @Get()
    findAll() {
        return this.masterCourseDurationService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.masterCourseDurationService.findOne(id);
    }

    @Post()
    create(@Body() dto: Partial<MasterCourseDuration>) {
        return this.masterCourseDurationService.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<MasterCourseDuration>) {
        return this.masterCourseDurationService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.masterCourseDurationService.remove(id);
    }
}
