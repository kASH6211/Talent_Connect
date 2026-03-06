import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRoleQualificationMapping } from './job-role-qualification-mapping.entity';
import { JobRoleQualificationMappingService } from './job-role-qualification-mapping.service';
import { JobRoleQualificationMappingController } from './job-role-qualification-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobRoleQualificationMapping])],
  controllers: [JobRoleQualificationMappingController],
  providers: [JobRoleQualificationMappingService],
  exports: [JobRoleQualificationMappingService],
})
export class JobRoleQualificationMappingModule { }
