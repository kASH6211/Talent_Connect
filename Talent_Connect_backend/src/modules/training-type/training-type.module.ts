import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingType } from './training-type.entity';
import { TrainingTypeService } from './training-type.service';
import { TrainingTypeController } from './training-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType])],
  controllers: [TrainingTypeController],
  providers: [TrainingTypeService],
  exports: [TrainingTypeService],
})
export class TrainingTypeModule {}
