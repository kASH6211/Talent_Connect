import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryTrainingPlacement } from './industry-training-placement.entity';
import { IndustryTrainingPlacementService } from './industry-training-placement.service';
import { IndustryTrainingPlacementController } from './industry-training-placement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryTrainingPlacement])],
  controllers: [IndustryTrainingPlacementController],
  providers: [IndustryTrainingPlacementService],
  exports: [IndustryTrainingPlacementService],
})
export class IndustryTrainingPlacementModule {}
