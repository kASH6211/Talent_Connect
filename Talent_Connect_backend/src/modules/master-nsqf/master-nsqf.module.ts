import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterNsqfService } from './master-nsqf.service';
import { MasterNsqfController } from './master-nsqf.controller';
import { MasterNsqf } from './master-nsqf.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MasterNsqf])],
    controllers: [MasterNsqfController],
    providers: [MasterNsqfService],
    exports: [MasterNsqfService],
})
export class MasterNsqfModule { }
