import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './job-offer.entity';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';

import { InstituteModule } from '../institute/institute.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer]),
        InstituteModule,
    ],
    providers: [JobOfferService],
    controllers: [JobOfferController],
    exports: [JobOfferService],
})
export class JobOfferModule { }
