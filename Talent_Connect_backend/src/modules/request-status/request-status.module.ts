import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestStatus } from './request-status.entity';
import { RequestStatusService } from './request-status.service';
import { RequestStatusController } from './request-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RequestStatus])],
  controllers: [RequestStatusController],
  providers: [RequestStatusService],
  exports: [RequestStatusService],
})
export class RequestStatusModule {}
