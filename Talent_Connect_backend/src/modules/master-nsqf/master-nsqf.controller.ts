import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MasterNsqfService } from './master-nsqf.service';
import { MasterNsqf } from './master-nsqf.entity';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('master-nsqf')
@Controller('master-nsqf')
export class MasterNsqfController {
    constructor(private readonly masterNsqfService: MasterNsqfService) { }

    @Public()
    @Get()
    findAll() {
        return this.masterNsqfService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.masterNsqfService.findOne(id);
    }

    @Post()
    create(@Body() dto: Partial<MasterNsqf>) {
        return this.masterNsqfService.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<MasterNsqf>) {
        return this.masterNsqfService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.masterNsqfService.remove(id);
    }
}
