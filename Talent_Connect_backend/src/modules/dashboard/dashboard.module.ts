import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JobOffer } from '../job-offer/job-offer.entity';
import { Institute } from '../institute/institute.entity';
import { Industry } from '../industry/industry.entity';
import { Student } from '../student/student.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer, Institute, Industry, Student]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
