import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteProgramMapping } from './institute-program-mapping.entity';
import { InstituteProgramMappingService } from './institute-program-mapping.service';
import { InstituteProgramMappingController } from './institute-program-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteProgramMapping])],
  controllers: [InstituteProgramMappingController],
  providers: [InstituteProgramMappingService],
  exports: [InstituteProgramMappingService],
})
export class InstituteProgramMappingModule {}
