import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryScale } from './industry-scale.entity';
import { IndustryScaleService } from './industry-scale.service';
import { IndustryScaleController } from './industry-scale.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryScale])],
  controllers: [IndustryScaleController],
  providers: [IndustryScaleService],
  exports: [IndustryScaleService],
})
export class IndustryScaleModule {}
