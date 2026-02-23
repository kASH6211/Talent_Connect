import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliation } from './affiliation.entity';
import { AffiliationService } from './affiliation.service';
import { AffiliationController } from './affiliation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliation])],
  controllers: [AffiliationController],
  providers: [AffiliationService],
  exports: [AffiliationService],
})
export class AffiliationModule {}
