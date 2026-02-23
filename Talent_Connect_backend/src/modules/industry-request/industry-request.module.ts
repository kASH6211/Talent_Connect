import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryRequest } from './industry-request.entity';
import { IndustryRequestService } from './industry-request.service';
import { IndustryRequestController } from './industry-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryRequest])],
  controllers: [IndustryRequestController],
  providers: [IndustryRequestService],
  exports: [IndustryRequestService],
})
export class IndustryRequestModule {}
