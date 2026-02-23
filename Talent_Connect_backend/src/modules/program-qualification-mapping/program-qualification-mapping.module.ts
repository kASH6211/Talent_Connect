import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramQualificationMapping } from './program-qualification-mapping.entity';
import { ProgramQualificationMappingService } from './program-qualification-mapping.service';
import { ProgramQualificationMappingController } from './program-qualification-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramQualificationMapping])],
  controllers: [ProgramQualificationMappingController],
  providers: [ProgramQualificationMappingService],
  exports: [ProgramQualificationMappingService],
})
export class ProgramQualificationMappingModule {}
