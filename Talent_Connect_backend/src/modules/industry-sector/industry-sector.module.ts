import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustrySector } from './industry-sector.entity';
import { IndustrySectorService } from './industry-sector.service';
import { IndustrySectorController } from './industry-sector.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustrySector])],
  controllers: [IndustrySectorController],
  providers: [IndustrySectorService],
  exports: [IndustrySectorService],
})
export class IndustrySectorModule {}
