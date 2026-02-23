import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPlacement } from './student-placement.entity';
import { StudentPlacementService } from './student-placement.service';
import { StudentPlacementController } from './student-placement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentPlacement])],
  controllers: [StudentPlacementController],
  providers: [StudentPlacementService],
  exports: [StudentPlacementService],
})
export class StudentPlacementModule {}
