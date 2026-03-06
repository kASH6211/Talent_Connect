import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCourseDurationService } from './master-course-duration.service';
import { MasterCourseDurationController } from './master-course-duration.controller';
import { MasterCourseDuration } from './master-course-duration.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MasterCourseDuration])],
    controllers: [MasterCourseDurationController],
    providers: [MasterCourseDurationService],
    exports: [MasterCourseDurationService],
})
export class MasterCourseDurationModule { }
