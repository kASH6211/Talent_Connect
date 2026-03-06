import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterSessionService } from './master-session.service';
import { MasterSessionController } from './master-session.controller';
import { MasterSession } from './master-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MasterSession])],
    controllers: [MasterSessionController],
    providers: [MasterSessionService],
    exports: [MasterSessionService],
})
export class MasterSessionModule { }
