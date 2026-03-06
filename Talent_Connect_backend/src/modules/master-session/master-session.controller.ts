import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MasterSessionService } from './master-session.service';
import { MasterSession } from './master-session.entity';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('master-session')
@Controller('master-session')
export class MasterSessionController {
    constructor(private readonly masterSessionService: MasterSessionService) { }

    @Public()
    @Get()
    findAll() {
        return this.masterSessionService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.masterSessionService.findOne(id);
    }

    @Post()
    create(@Body() dto: Partial<MasterSession>) {
        return this.masterSessionService.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<MasterSession>) {
        return this.masterSessionService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.masterSessionService.remove(id);
    }
}
