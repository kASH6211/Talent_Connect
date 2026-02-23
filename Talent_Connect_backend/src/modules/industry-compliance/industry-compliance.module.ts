import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryCompliance } from './industry-compliance.entity';
import { IndustryComplianceService } from './industry-compliance.service';
import { IndustryComplianceController } from './industry-compliance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryCompliance])],
  controllers: [IndustryComplianceController],
  providers: [IndustryComplianceService],
  exports: [IndustryComplianceService],
})
export class IndustryComplianceModule {}
