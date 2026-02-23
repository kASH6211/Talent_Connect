import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regulatory } from './regulatory.entity';
import { RegulatoryService } from './regulatory.service';
import { RegulatoryController } from './regulatory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Regulatory])],
  controllers: [RegulatoryController],
  providers: [RegulatoryService],
  exports: [RegulatoryService],
})
export class RegulatoryModule {}
